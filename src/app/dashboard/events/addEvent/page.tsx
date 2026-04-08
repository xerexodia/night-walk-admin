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
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toSlug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

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
  socialLinks: { facebook: string; twitter: string; instagram: string; linkedin: string; website: string };
  image: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  price?: string;
  location?: { address?: string };
  socialLinks?: { website?: string };
  image?: string;
}

const AddEventPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<{ current: number; total: number } | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [recurringMode, setRecurringMode] = useState<'weekly' | 'custom'>('weekly');
  const [weeklyDay, setWeeklyDay] = useState<number>(0);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [newCustomDate, setNewCustomDate] = useState('');

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
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', website: '' },
    image: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.data);
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Generate all occurrence dates for preview and submission
  const generatedDates = useMemo(() => {
    if (!isRecurring || !formData.startDateTime || !formData.endDateTime) return [];

    const startTime = new Date(formData.startDateTime);
    const endTime = new Date(formData.endDateTime);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return [];
    const duration = endTime.getTime() - startTime.getTime();
    if (duration <= 0) return [];

    if (recurringMode === 'weekly') {
      if (!recurringEndDate) return [];
      const endDate = new Date(recurringEndDate);
      endDate.setHours(23, 59, 59);
      if (isNaN(endDate.getTime())) return [];

      const dates: Array<{ start: Date; end: Date }> = [];
      const current = new Date(startTime);
      // Advance to first occurrence of the selected weekday
      while (current.getDay() !== weeklyDay) current.setDate(current.getDate() + 1);
      current.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      while (current <= endDate && dates.length < 52) {
        const s = new Date(current);
        dates.push({ start: s, end: new Date(s.getTime() + duration) });
        current.setDate(current.getDate() + 7);
      }
      return dates;
    } else {
      // Custom dates
      return [...customDates]
        .sort()
        .map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          const s = new Date(startTime);
          s.setFullYear(year, month - 1, day);
          return { start: new Date(s), end: new Date(s.getTime() + duration) };
        });
    }
  }, [isRecurring, recurringMode, weeklyDay, recurringEndDate, customDates, formData.startDateTime, formData.endDateTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    updateFormData(e.target.name, e.target.value);
  };

  const handleSelectChange = (name: string, value: string) => updateFormData(name, value);

  const handleCategoriesChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoriesIds: prev.categoriesIds.includes(categoryId)
        ? prev.categoriesIds.filter(id => id !== categoryId)
        : [...prev.categoriesIds, categoryId],
    }));
  };

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (place?.geometry?.location) {
      setFormData(prev => ({
        ...prev,
        location: {
          address: place.formatted_address || '',
          latitude: place.geometry!.location!.lat(),
          longitude: place.geometry!.location!.lng(),
        },
      }));
    }
  };

  const updateFormData = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof typeof prev] as object), [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (file: File | null) => setFormData(prev => ({ ...prev, image: file }));

  const addCustomDate = () => {
    if (!newCustomDate || customDates.includes(newCustomDate)) return;
    setCustomDates(prev => [...prev, newCustomDate]);
    setNewCustomDate('');
  };

  const removeCustomDate = (date: string) => setCustomDates(prev => prev.filter(d => d !== date));

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDateTime) newErrors.startDateTime = 'Start date is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End date is required';
    if (formData.type === 'paid' && !formData.price) newErrors.price = 'Price is required for paid events';
    if (!formData.location.address.trim()) newErrors.location = { address: 'Location address is required' };
    if (formData.type === 'paid' && !formData.socialLinks.website) newErrors.socialLinks = { website: 'Website URL is required for paid events' };
    if (!formData.image) newErrors.image = 'Event image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (startISO: string, endISO: string): FormData_API => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('type', formData.type);
    if (formData.type === 'paid' && formData.price) fd.append('price', formData.price);
    fd.append('startDateTime', startISO);
    fd.append('endDateTime', endISO);
    fd.append('visibility', formData.visibility);
    if (isRecurring && seriesName.trim()) fd.append('seriesId', toSlug(seriesName));
    fd.append('categoriesIds', JSON.stringify(formData.categoriesIds));
    fd.append('location', JSON.stringify(formData.location));
    fd.append('socialLinks', JSON.stringify(formData.socialLinks));
    if (formData.image) fd.append('image', formData.image);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fill in all required fields'); return; }

    if (isRecurring) {
      if (generatedDates.length === 0) {
        toast.error(recurringMode === 'weekly' ? 'Set an end date to generate occurrences' : 'Add at least one date');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitProgress(null);

    try {
      if (isRecurring && generatedDates.length > 0) {
        let created = 0;
        let failed = 0;
        const total = generatedDates.length;

        for (let i = 0; i < generatedDates.length; i++) {
          setSubmitProgress({ current: i + 1, total });
          const { start, end } = generatedDates[i];
          const payload = buildPayload(start.toISOString(), end.toISOString());
          const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}events`, { method: 'POST', body: payload });
          if (res.ok) created++;
          else failed++;
        }

        if (failed === 0) {
          toast.success(`${created} events created successfully!`);
        } else {
          toast.warning(`${created} created, ${failed} failed`);
        }
        router.push('/dashboard/events');
      } else {
        const payload = buildPayload(
          new Date(formData.startDateTime).toISOString(),
          new Date(formData.endDateTime).toISOString(),
        );
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}events`, { method: 'POST', body: payload });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create event');
        }
        toast.success('Event created successfully!');
        router.push('/dashboard/events');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(null);
    }
  };

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Add Event' />

      <form onSubmit={handleSubmit} className='flex flex-col bg-white p-6 rounded-lg shadow-md gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* LEFT COLUMN */}
          <div className='space-y-6'>
            <div>
              <Label>Event Title*</Label>
              <Input type='text' name='title' value={formData.title} onChange={handleInputChange} placeholder='Tech Conference 2024' className={errors.title ? 'border-red-500' : ''} required />
              {errors.title && <p className='mt-1 text-sm text-red-500'>{errors.title}</p>}
            </div>

            <div>
              <Label>Event Description*</Label>
              <TextArea value={formData.description} onChange={value => handleInputChange({ target: { name: 'description', value } })} placeholder='Describe your event in detail' rows={6} className={errors.description ? 'border-red-500' : ''} />
              {errors.description && <p className='mt-1 text-sm text-red-500'>{errors.description}</p>}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Event Type*</Label>
                <div className='relative'>
                  {/* @ts-ignore */}
                  <Select value={formData.type} onChange={(value: string) => handleSelectChange('type', value)} options={eventTypes} className='w-full dark:bg-dark-900' required />
                  <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'><ChevronDownIcon /></span>
                </div>
              </div>
              {formData.type === 'paid' && (
                <div>
                  <Label>Price ($)*</Label>
                  <Input type='number' name='price' value={formData.price} onChange={handleInputChange} placeholder='99.99' step='0.01' min='0' required={formData.type === 'paid'} />
                  {errors.price && <p className='mt-1 text-sm text-red-500'>{errors.price}</p>}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>{isRecurring ? 'Start Time (first occurrence)*' : 'Start Date & Time*'}</Label>
                <Input type='datetime-local' name='startDateTime' value={formData.startDateTime} onChange={handleInputChange} className={errors.startDateTime ? 'border-red-500' : ''} required />
                {errors.startDateTime && <p className='mt-1 text-sm text-red-500'>{errors.startDateTime}</p>}
              </div>
              <div>
                <Label>{isRecurring ? 'End Time (first occurrence)*' : 'End Date & Time*'}</Label>
                <Input type='datetime-local' name='endDateTime' value={formData.endDateTime} onChange={handleInputChange} min={formData.startDateTime} className={errors.endDateTime ? 'border-red-500' : ''} required />
                {errors.endDateTime && <p className='mt-1 text-sm text-red-500'>{errors.endDateTime}</p>}
              </div>
            </div>

            {/* ── RECURRING SECTION ── */}
            <div className='border border-gray-200 rounded-lg p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-gray-800 text-sm'>Recurring Event</p>
                  <p className='text-xs text-gray-500 mt-0.5'>Create multiple occurrences of this event</p>
                </div>
                <button
                  type='button'
                  onClick={() => setIsRecurring(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isRecurring ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {isRecurring && (
                <div className='space-y-4'>
                  {/* Mode tabs */}
                  <div className='flex rounded-md border border-gray-200 overflow-hidden'>
                    {(['weekly', 'custom'] as const).map(mode => (
                      <button
                        key={mode}
                        type='button'
                        onClick={() => setRecurringMode(mode)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${recurringMode === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        {mode === 'weekly' ? '📅 Weekly' : '🗓 Custom Dates'}
                      </button>
                    ))}
                  </div>

                  {/* Series Name */}
                  <div>
                    <p className='text-xs font-medium text-gray-600 mb-1'>Series Name <span className='text-red-500'>*</span></p>
                    <input
                      type='text'
                      value={seriesName}
                      onChange={e => setSeriesName(e.target.value)}
                      placeholder='e.g. Sunday Night Sessions'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    {seriesName && (
                      <p className='text-xs text-gray-400 mt-1'>Slug: <span className='font-mono'>{toSlug(seriesName)}</span></p>
                    )}
                  </div>

                  {recurringMode === 'weekly' ? (
                    <div className='space-y-3'>
                      <div>
                        <p className='text-xs font-medium text-gray-600 mb-2'>Repeat on</p>
                        <div className='flex gap-1 flex-wrap'>
                          {DAYS_OF_WEEK.map((day, idx) => (
                            <button
                              key={day}
                              type='button'
                              onClick={() => setWeeklyDay(idx)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${weeklyDay === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-600 mb-1'>End date</p>
                        <input
                          type='date'
                          value={recurringEndDate}
                          onChange={e => setRecurringEndDate(e.target.value)}
                          min={formData.startDateTime ? formData.startDateTime.split('T')[0] : ''}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div>
                        <p className='text-xs font-medium text-gray-600 mb-1'>Add dates</p>
                        <div className='flex gap-2'>
                          <input
                            type='date'
                            value={newCustomDate}
                            onChange={e => setNewCustomDate(e.target.value)}
                            className='flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                          <button
                            type='button'
                            onClick={addCustomDate}
                            disabled={!newCustomDate}
                            className='px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-40'
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      {customDates.length > 0 && (
                        <div className='space-y-1 max-h-32 overflow-y-auto'>
                          {[...customDates].sort().map(date => (
                            <div key={date} className='flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded text-sm'>
                              <span className='text-gray-700'>{new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <button type='button' onClick={() => removeCustomDate(date)} className='text-red-400 hover:text-red-600 ml-3 text-xs'>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview */}
                  {generatedDates.length > 0 && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                      <p className='text-xs font-semibold text-blue-700 mb-2'>
                        {generatedDates.length} event{generatedDates.length > 1 ? 's' : ''} will be created:
                      </p>
                      <div className='space-y-1 max-h-36 overflow-y-auto'>
                        {generatedDates.map((d, i) => (
                          <p key={i} className='text-xs text-blue-600'>{i + 1}. {fmt(d.start)} → {d.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Visibility*</Label>
              <div className='relative'>
                {/* @ts-ignore */}
                <Select selectedValue={formData.visibility} onValueChange={(value: string) => handleSelectChange('visibility', value)} options={visibilityOptions} className='w-full dark:bg-dark-900' required />
                <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'><ChevronDownIcon /></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className='space-y-6'>
            <div>
              <Label>Event Image*</Label>
              <FileInput onChange={event => handleFileChange(event.target.files?.[0] || null)} className={`${errors.image ? 'border-red-500' : ''} w-full`} />
              {errors.image && <p className='mt-1 text-sm text-red-500'>{errors.image}</p>}
            </div>

            <div>
              <Label>Location*</Label>
              <Autocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={handlePlaceSelected}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location?.address ? 'border-red-500' : ''}`}
                placeholder='Start typing an address...'
                options={{ types: ['address'], fields: ['formatted_address', 'geometry.location'] }}
                defaultValue={formData.location.address}
                required
              />
              <p className='text-sm text-gray-500 mt-1'>Start typing to see address suggestions. Coordinates will be auto-filled.</p>
              {errors.location?.address && <p className='mt-1 text-sm text-red-500'>{errors.location.address}</p>}
            </div>

            <div>
              <Label>Categories</Label>
              <div className='space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2'>
                {isLoadingCategories ? (
                  <p className='text-sm text-gray-500'>Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className='text-sm text-gray-500'>No categories available</p>
                ) : (
                  categories.map(category => (
                    <label key={category.id} className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded'>
                      <input type='checkbox' checked={formData.categoriesIds.includes(category.id)} onChange={() => handleCategoriesChange(category.id)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                      <span className='text-sm'>{category.title}</span>
                    </label>
                  ))
                )}
              </div>
              <p className='text-sm text-gray-500 mt-1'>Select relevant categories for your event</p>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label>Social Links</Label>
                <span className='text-sm text-gray-500'>{formData.type === 'paid' ? 'Website is required for paid events' : 'Website is optional'}</span>
              </div>
              <Input type='url' name='socialLinks.facebook' value={formData.socialLinks.facebook} onChange={handleInputChange} placeholder='Facebook URL' />
              <Input type='url' name='socialLinks.twitter' value={formData.socialLinks.twitter} onChange={handleInputChange} placeholder='Twitter URL' />
              <Input type='url' name='socialLinks.instagram' value={formData.socialLinks.instagram} onChange={handleInputChange} placeholder='Instagram URL' />
              <Input type='url' name='socialLinks.linkedin' value={formData.socialLinks.linkedin} onChange={handleInputChange} placeholder='LinkedIn URL' />
              <div>
                <div className='relative'>
                  <Input type='url' name='socialLinks.website' value={formData.socialLinks.website} onChange={handleInputChange} placeholder='Website URL' className={errors.socialLinks?.website ? 'border-red-500 pr-10' : 'pr-10'} required={formData.type === 'paid'} />
                  {formData.type === 'paid' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-red-500'>*</span>}
                </div>
                {errors.socialLinks?.website && <p className='mt-1 text-sm text-red-500'>{errors.socialLinks.website}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className='w-full h-px bg-gray-200 my-2' />

        {/* Progress bar during bulk creation */}
        {submitProgress && (
          <div className='space-y-1'>
            <div className='flex justify-between text-sm text-gray-600'>
              <span>Creating events...</span>
              <span>{submitProgress.current} / {submitProgress.total}</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className='flex items-center justify-end gap-4'>
          <Button variant='outline' size='md' onClick={() => router.push('/dashboard/events')} disabled={isSubmitting} className='px-4 py-2'>
            Cancel
          </Button>
          <Button size='md' className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50' disabled={isSubmitting}>
            {isSubmitting
              ? submitProgress
                ? `Creating ${submitProgress.current} of ${submitProgress.total}...`
                : 'Creating...'
              : isRecurring && generatedDates.length > 0
              ? `Create ${generatedDates.length} Events`
              : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Type alias to avoid conflict with global FormData
type FormData_API = globalThis.FormData;

export default AddEventPage;
