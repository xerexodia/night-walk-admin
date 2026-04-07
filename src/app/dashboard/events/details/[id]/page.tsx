'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';

const fixImageUrl = (url: string) => {
  if (!url) return url;
  return url.replace(/^https?:\/\/localhost(:\d+)?/, process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '');
};

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
    })
      .then((r) => r.json())
      .then((data) => setEvent(data.data))
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
      });
      if (res.ok) {
        toast.success('Event deleted');
        router.push('/dashboard/events');
      } else {
        toast.error('Failed to delete event');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <FullScreenLoader />;
  if (!event)
    return <p className='p-6 text-gray-500'>Event not found.</p>;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Event Details' />

      <div className='bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden'>
        {event.image && (
          <div className='relative h-64 w-full'>
            <Image
              src={fixImageUrl(event.image)}
              alt={event.title}
              fill
              className='object-cover'
            />
          </div>
        )}

        <div className='p-6 flex flex-col gap-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-white/90'>
                {event.title}
              </h2>
              <p className='mt-1 text-gray-500 dark:text-gray-400'>
                {event.description}
              </p>
            </div>
            <div className='flex gap-2 flex-shrink-0'>
              <Badge color={event.type === 'paid' ? 'success' : 'primary'}>
                {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
              </Badge>
              <Badge>
                {event.visibility?.charAt(0).toUpperCase() +
                  event.visibility?.slice(1)}
              </Badge>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium text-gray-500 mr-2'>Start:</span>
              <span>{fmt(event.startDateTime)}</span>
            </div>
            <div>
              <span className='font-medium text-gray-500 mr-2'>End:</span>
              <span>{fmt(event.endDateTime)}</span>
            </div>
            <div>
              <span className='font-medium text-gray-500 mr-2'>Location:</span>
              <span>{event.location?.address ?? 'N/A'}</span>
            </div>
            <div>
              <span className='font-medium text-gray-500 mr-2'>
                Participants:
              </span>
              <span>{event.numberOfParticipants}</span>
            </div>
            <div>
              <span className='font-medium text-gray-500 mr-2'>Views:</span>
              <span>{event.numberOfViews}</span>
            </div>
            {event.price && (
              <div>
                <span className='font-medium text-gray-500 mr-2'>Price:</span>
                <span>${parseFloat(event.price).toFixed(2)}</span>
              </div>
            )}
          </div>

          {event.categories?.length > 0 && (
            <div>
              <span className='font-medium text-gray-500 text-sm mr-2'>
                Categories:
              </span>
              <div className='inline-flex flex-wrap gap-2 mt-1'>
                {event.categories.map((c: { id: number; title: string }) => (
                  <Badge key={c.id} size='sm'>{c.title}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800'>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className='px-4 py-2 text-sm border border-red-500 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50'
            >
              {deleting ? 'Deleting...' : 'Delete Event'}
            </button>
            <button
              onClick={() => router.push(`/dashboard/events/edit/${id}`)}
              className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Edit Event
            </button>
          </div>
        </div>
      </div>

      {(deleting) && <FullScreenLoader />}
    </div>
  );
};

export default EventDetailsPage;
