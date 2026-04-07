/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon } from '@/icons';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Autocomplete from 'react-google-autocomplete';

const eventTypes = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

interface FormData {
  title: string;
  description: string;
  type: 'free' | 'paid';
  price: string;
  startDateTime: string;
  endDateTime: string;
  visibility: 'public' | 'private';
  location: { address: string; latitude: number; longitude: number };
  categoriesIds: string[];
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    website: string;
  };
  image: File | null;
  existingImageUrl: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  price?: string;
  location?: { address?: string };
  socialLinks?: { website?: string };
}

const toLocalDatetimeValue = (iso: string) => {
  if (!iso) return '';
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

const fixImageUrl = (url: string) => {
  if (!url) return url;
  return url.replace(/^https?:\/\/localhost(:\d+)?/, process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '');
};

const EditEventPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'free',
    price: '',
    startDateTime: '',
    endDateTime: '',
    visibility: 'public',
    location: { address: '', latitude: 0, longitude: 0 },
    categoriesIds: [],
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      website: '',
    },
    image: null,
    existingImageUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch event + categories
  useEffect(() => {
    Promise.all([
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}events/${id}`).then(
        (r) => r.json(),
      ),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}categories`).then(
        (r) => r.json(),
      ),
    ])
      .then(([eventRes, catRes]) => {
        const e = eventRes.data;
        setCategories(catRes.data ?? []);
        setFormData({
          title: e.title ?? '',
          description: e.description ?? '',
          type: e.type ?? 'free',
          price: e.price ? String(e.price) : '',
          startDateTime: toLocalDatetimeValue(e.startDateTime),
          endDateTime: toLocalDatetimeValue(e.endDateTime),
          visibility: e.visibility ?? 'public',
          location: e.location ?? { address: '', latitude: 0, longitude: 0 },
          categoriesIds: (e.categories ?? []).map((c: { id: number }) =>
            String(c.id),
          ),
          socialLinks: e.socialLinks ?? {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            website: '',
          },
          image: null,
          existingImageUrl: e.image ?? '',
        });
      })
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof typeof prev] as object), [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoriesIds: prev.categoriesIds.includes(categoryId)
        ? prev.categoriesIds.filter((id) => id !== categoryId)
        : [...prev.categoriesIds, categoryId],
    }));
  };

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (place?.geometry?.location) {
      setFormData((prev) => ({
        ...prev,
        location: {
          address: place.formatted_address ?? '',
          latitude: place.geometry!.location!.lat(),
          longitude: place.geometry!.location!.lng(),
        },
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.startDateTime)
      newErrors.startDateTime = 'Start date is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End date is required';
    if (formData.type === 'paid' && !formData.price)
      newErrors.price = 'Price is required for paid events';
    if (!formData.location.address.trim())
      newErrors.location = { address: 'Location is required' };
    if (formData.type === 'paid' && !formData.socialLinks.website)
      newErrors.socialLinks = { website: 'Website is required for paid events' };
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);

    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('type', formData.type);
      if (formData.type === 'paid' && formData.price)
        body.append('price', formData.price);
      body.append('startDateTime', new Date(formData.startDateTime).toISOString());
      body.append('endDateTime', new Date(formData.endDateTime).toISOString());
      body.append('visibility', formData.visibility);
      body.append('location', JSON.stringify(formData.location));
      body.append('categoriesIds', JSON.stringify(formData.categoriesIds));
      body.append('socialLinks', JSON.stringify(formData.socialLinks));
      if (formData.image) body.append('image', formData.image);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}events/${id}`,
        { method: 'PATCH', body },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update event');
      }

      toast.success('Event updated successfully!');
      router.push('/dashboard/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-500'>Loading event...</p>
      </div>
    );

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Edit Event' />

      <form
        onSubmit={handleSubmit}
        className='flex flex-col bg-white p-6 rounded-lg shadow-md gap-6'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left column */}
          <div className='space-y-6'>
            <div>
              <Label>Event Title*</Label>
              <Input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Tech Conference 2024'
                className={errors.title ? 'border-red-500' : ''}
                required
              />
              {errors.title && (
                <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Event Description*</Label>
              <TextArea
                value={formData.description}
                onChange={(value) =>
                  handleInputChange({ target: { name: 'description', value } })
                }
                placeholder='Describe your event'
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-500'>{errors.description}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Event Type*</Label>
                <div className='relative'>
                  <Select
                    //@ts-ignore
                    value={formData.type}
                    onChange={(value: string) => handleSelectChange('type', value)}
                    options={eventTypes}
                    className='w-full dark:bg-dark-900'
                  />
                  <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'>
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              {formData.type === 'paid' && (
                <div>
                  <Label>Price ($)*</Label>
                  <Input
                    type='number'
                    name='price'
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder='99.99'
                    step='0.01'
                    min='0'
                  />
                  {errors.price && (
                    <p className='mt-1 text-sm text-red-500'>{errors.price}</p>
                  )}
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Start Date & Time*</Label>
                <Input
                  type='datetime-local'
                  name='startDateTime'
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  className={errors.startDateTime ? 'border-red-500' : ''}
                />
                {errors.startDateTime && (
                  <p className='mt-1 text-sm text-red-500'>{errors.startDateTime}</p>
                )}
              </div>
              <div>
                <Label>End Date & Time*</Label>
                <Input
                  type='datetime-local'
                  name='endDateTime'
                  value={formData.endDateTime}
                  onChange={handleInputChange}
                  min={formData.startDateTime}
                  className={errors.endDateTime ? 'border-red-500' : ''}
                />
                {errors.endDateTime && (
                  <p className='mt-1 text-sm text-red-500'>{errors.endDateTime}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Visibility*</Label>
              <div className='relative'>
                <Select
                  //@ts-ignore
                  selectedValue={formData.visibility}
                  onValueChange={(value: string) =>
                    handleSelectChange('visibility', value)
                  }
                  options={visibilityOptions}
                  className='w-full dark:bg-dark-900'
                />
                <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'>
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className='space-y-6'>
            <div>
              <Label>Event Image (leave blank to keep current)</Label>
              {formData.existingImageUrl && (
                <img
                  src={fixImageUrl(formData.existingImageUrl)}
                  alt='Current event image'
                  className='mb-2 h-32 w-full object-cover rounded-md'
                />
              )}
              <FileInput
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    image: event.target.files?.[0] || null,
                  }))
                }
                className='w-full'
              />
            </div>

            <div>
              <Label>Location*</Label>
              <Autocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={handlePlaceSelected}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location?.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Start typing an address...'
                options={{ types: ['address'], fields: ['formatted_address', 'geometry.location'] }}
                defaultValue={formData.location.address}
              />
              <p className='text-sm text-gray-500 mt-1'>
                Current: {formData.location.address}
              </p>
              {errors.location?.address && (
                <p className='mt-1 text-sm text-red-500'>{errors.location.address}</p>
              )}
            </div>

            <div>
              <Label>Categories</Label>
              <div className='space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2'>
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded'
                  >
                    <input
                      type='checkbox'
                      checked={formData.categoriesIds.includes(String(category.id))}
                      onChange={() => handleCategoriesChange(String(category.id))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-sm'>{category.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Social Links</Label>
              {(['facebook', 'twitter', 'instagram', 'linkedin', 'website'] as const).map(
                (platform) => (
                  <div key={platform}>
                    <Input
                      type='url'
                      name={`socialLinks.${platform}`}
                      value={formData.socialLinks[platform]}
                      onChange={handleInputChange}
                      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      required={platform === 'website' && formData.type === 'paid'}
                    />
                    {platform === 'website' && errors.socialLinks?.website && (
                      <p className='mt-1 text-sm text-red-500'>{errors.socialLinks.website}</p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className='w-full h-px bg-gray-200 my-2' />

        <div className='flex items-center justify-end gap-4'>
          <Button
            variant='outline'
            size='md'
            onClick={() => router.push('/dashboard/events')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size='md'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
