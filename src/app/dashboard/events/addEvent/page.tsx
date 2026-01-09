/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon } from '@/icons';
import { useRouter } from 'next/navigation';
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
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  categoriesIds: string[];
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    website: string;
  };
  image: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  price?: string;
  location?: {
    address?: string;
    latitude?: string;
    longitude?: string;
  };
  socialLinks?: {
    website?: string;
  };
  image?: string;
}

const AddEventPage = () => {
  const token = localStorage.getItem('token');

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'free',
    price: '',
    startDateTime: '',
    endDateTime: '',
    visibility: 'public',
    location: {
      address: '',
      latitude: 0,
      longitude: 0,
    },
    categoriesIds: [],
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      website: '',
    },
    image: null as File | null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Handle input changes for both regular inputs and Select component
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  // Alias for Select component to maintain consistency
  const handleSelectChange = (name: string, value: string) => {
    updateFormData(name, value);
  };

  // Handle categories selection
  const handleCategoriesChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoriesIds: prev.categoriesIds.includes(categoryId)
        ? prev.categoriesIds.filter(id => id !== categoryId)
        : [...prev.categoriesIds, categoryId],
    }));
  };

  // Handle address autocomplete with Google Places API
  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (place && place.geometry && place.geometry.location) {
      const address = place.formatted_address || '';
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      
      setFormData(prev => ({
        ...prev,
        location: {
          address,
          latitude,
          longitude,
        },
      }));
    }
  };

  // Update form data with the given name and value
  const updateFormData = (name: string, value: string) => {
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else if (name.includes('socialLinks.')) {
      const socialMedia = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialMedia]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.startDateTime)
      newErrors.startDateTime = 'Start date is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End date is required';
    if (formData.type === 'paid' && !formData.price)
      newErrors.price = 'Price is required for paid events';

    // Location validation - address is required, coordinates are auto-filled
    if (!formData.location.address.trim()) {
      newErrors.location = {
        ...newErrors.location,
        address: 'Location address is required',
      };
    }
    // Note: latitude and longitude are auto-filled by Google Places autocomplete
    // so we don't validate them here as they'll be populated when a place is selected

    // Only website is required for paid events
    if (formData.type === 'paid' && !formData.socialLinks.website) {
      newErrors.socialLinks = {
        ...newErrors.socialLinks,
        website: 'Website URL is required for paid events',
      };
    }

    // Image validation
    if (!formData.image) {
      newErrors.image = 'Event image is required';
    }

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
      if (!token) {
        toast.error('Please log in to create an event');
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();

      // Append all form data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      if (formData.type === 'paid' && formData.price) {
        formDataToSend.append('price', formData.price);
      }
      formDataToSend.append(
        'startDateTime',
        new Date(formData.startDateTime).toISOString(),
      );
      formDataToSend.append(
        'endDateTime',
        new Date(formData.endDateTime).toISOString(),
      );
      formDataToSend.append('visibility', formData.visibility);
      formDataToSend.append(
        'categoriesIds',
        JSON.stringify(formData.categoriesIds),
      );

      // Append location
      formDataToSend.append('location', JSON.stringify(formData.location));

      // Append social links
      formDataToSend.append(
        'socialLinks',
        JSON.stringify(formData.socialLinks),
      );

      // Append image if exists
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      // Debug: Log form data contents
      console.log('🚀 ~ handleSubmit ~ Form Data Contents:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      await response.json();
      toast.success('Event created successfully!');
      router.push('/dashboard/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create event',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Add Event' />

      <form
        onSubmit={handleSubmit}
        className='flex flex-col bg-white p-6 rounded-lg shadow-md gap-6'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div>
              <Label>Event Title*</Label>
              <div>
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
            </div>

            <div>
              <Label>Event Description*</Label>
              <div>
                <TextArea
                  value={formData.description}
                  onChange={value =>
                    handleInputChange({
                      target: { name: 'description', value },
                    })
                  }
                  placeholder='Describe your event in detail'
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Event Type*</Label>
                <div className='relative'>
                  <Select
                    //@ts-ignore
                    value={formData.type}
                    onChange={(value: string) =>
                      handleSelectChange('type', value)
                    }
                    options={eventTypes}
                    className='w-full dark:bg-dark-900'
                    required
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
                    required={formData.type === 'paid'}
                  />
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Start Date & Time*</Label>
                <div>
                  <Input
                    type='datetime-local'
                    name='startDateTime'
                    value={formData.startDateTime}
                    onChange={handleInputChange}
                    className={errors.startDateTime ? 'border-red-500' : ''}
                    required
                  />
                  {errors.startDateTime && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.startDateTime}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>End Date & Time*</Label>
                <div>
                  <Input
                    type='datetime-local'
                    name='endDateTime'
                    value={formData.endDateTime}
                    onChange={handleInputChange}
                    min={formData.startDateTime}
                    className={errors.endDateTime ? 'border-red-500' : ''}
                    required
                  />
                  {errors.endDateTime && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.endDateTime}
                    </p>
                  )}
                </div>
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
                  required
                />
                <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'>
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div>
              <Label>Event Image*</Label>
              <div>
                <FileInput
                  onChange={event =>
                    handleFileChange(event.target.files?.[0] || null)
                  }
                  className={`${errors.image ? 'border-red-500' : ''} w-full`}
                />
                {errors.image && (
                  <p className='mt-1 text-sm text-red-500'>{errors.image}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Location*</Label>
              <div className='space-y-4'>
                <div>
                  <Autocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={handlePlaceSelected}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.address ? 'border-red-500' : ''
                    }`}
                    placeholder='Start typing an address...'
                    options={{
                      types: ['address'],
                      fields: ['formatted_address', 'geometry.location'],
                    }}
                    defaultValue={formData.location.address}
                    required
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    Start typing to see address suggestions. Coordinates will be auto-filled.
                  </p>
                  {errors.location?.address && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.location.address}
                    </p>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Input
                      type='number'
                      name='location.latitude'
                      value={formData.location.latitude}
                      onChange={handleInputChange}
                      placeholder='Latitude'
                      step='any'
                      readOnly
                      className={`bg-gray-50 cursor-not-allowed ${
                        errors.location?.latitude ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.location?.latitude && (
                      <p className='mt-1 text-sm text-red-500'>
                        {errors.location.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type='number'
                      name='location.longitude'
                      value={formData.location.longitude}
                      onChange={handleInputChange}
                      placeholder='Longitude'
                      step='any'
                      readOnly
                      className={`bg-gray-50 cursor-not-allowed ${
                        errors.location?.longitude ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.location?.longitude && (
                      <p className='mt-1 text-sm text-red-500'>
                        {errors.location.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Categories</Label>
              <div className='space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2'>
                {isLoadingCategories ? (
                  <p className='text-sm text-gray-500'>Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className='text-sm text-gray-500'>
                    No categories available
                  </p>
                ) : (
                  categories?.map(category => (
                    <label
                      key={category.id}
                      className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded'
                    >
                      <input
                        type='checkbox'
                        checked={formData.categoriesIds.includes(category.id)}
                        onChange={() => handleCategoriesChange(category.id)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm'>{category.title}</span>
                    </label>
                  ))
                )}
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                Select relevant categories for your event
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label>Social Links</Label>
                <span className='text-sm text-gray-500'>
                  {formData.type === 'paid'
                    ? 'Website is required for paid events'
                    : 'Website is optional'}
                </span>
              </div>
              <Input
                type='url'
                name='socialLinks.facebook'
                value={formData.socialLinks.facebook}
                onChange={handleInputChange}
                placeholder='Facebook URL'
              />
              <Input
                type='url'
                name='socialLinks.twitter'
                value={formData.socialLinks.twitter}
                onChange={handleInputChange}
                placeholder='Twitter URL'
              />
              <Input
                type='url'
                name='socialLinks.instagram'
                value={formData.socialLinks.instagram}
                onChange={handleInputChange}
                placeholder='Instagram URL'
              />
              <Input
                type='url'
                name='socialLinks.linkedin'
                value={formData.socialLinks.linkedin}
                onChange={handleInputChange}
                placeholder='LinkedIn URL'
              />
              <div>
                <div className='relative'>
                  <Input
                    type='url'
                    name='socialLinks.website'
                    value={formData.socialLinks.website}
                    onChange={handleInputChange}
                    placeholder='Website URL'
                    className={
                      errors.socialLinks?.website
                        ? 'border-red-500 pr-10'
                        : 'pr-10'
                    }
                    required={formData.type === 'paid'}
                  />
                  {formData.type === 'paid' && (
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-red-500'>
                      *
                    </span>
                  )}
                </div>
                {errors.socialLinks?.website && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.socialLinks.website}
                  </p>
                )}
              </div>
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
            className='px-4 py-2'
          >
            Cancel
          </Button>
          <Button
            size='md'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEventPage;
