'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import Badge from '../ui/badge/Badge';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import FullScreenLoader from '../ui/loader/FullScreenLoader';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  startDateTime: string;
  endDateTime: string;
  type: string;
  price: string;
  numberOfParticipants: number;
  numberOfViews: number;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  visibility: string;
  tags: string[];
  participants: number[];
  isParticipating: boolean;
  isFollowing: boolean;
  isReminded: boolean;
  isCheckedIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EventsTable() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const router = useRouter();
  const itemsPerPage = 10;

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}events/${eventId}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error();
      toast.success('Event deleted');
      setSelectedIds(prev => { const next = new Set(prev); next.delete(eventId); return next; });
      fetchEvents(currentPage, search);
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const duplicateEvent = async (eventId: number) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}events/${eventId}/duplicate`,
        { method: 'POST' },
      );
      if (!response.ok) throw new Error();
      toast.success('Event duplicated');
      fetchEvents(currentPage, search);
    } catch {
      toast.error('Failed to duplicate event');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected event(s)? This cannot be undone.`)) return;
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}events/bulk`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        },
      );
      if (!response.ok) throw new Error();
      toast.success(`Deleted ${selectedIds.size} event(s)`);
      setSelectedIds(new Set());
      fetchEvents(currentPage, search);
    } catch {
      toast.error('Failed to bulk delete events');
    }
  };

  const fetchEvents = async (page: number, query: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        includePast: 'true',
      });
      if (query) params.set('query', query);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}events/search?${params}`,
      );

      if (response.status === 401) {
        router.push('/signin');
        return;
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      setData(result.data.items || []);
      setTotalItems(result.data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage, search);
  }, [currentPage, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (eventId: number) => {
    router.push(`/dashboard/events/details/${eventId}`);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(e => e.id)));
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${date}, ${time}`;
  };

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6'>
      {loading && <FullScreenLoader />}

      {/* Search bar + bulk actions */}
      <div className='flex items-center justify-between gap-2 mb-4'>
        <form onSubmit={handleSearch} className='flex gap-2 flex-1'>
          <input
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search events...'
            className='flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          />
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700'
          >
            Search
          </button>
          {search && (
            <button
              type='button'
              onClick={() => { setSearch(''); setSearchInput(''); setCurrentPage(1); }}
              className='px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
            >
              Clear
            </button>
          )}
        </form>
        {selectedIds.size > 0 && (
          <button
            onClick={bulkDelete}
            className='px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 whitespace-nowrap'
          >
            Delete {selectedIds.size} selected
          </button>
        )}
      </div>

      <div className='max-w-full overflow-x-auto'>
        <Table>
          <TableHeader className='border-gray-100 dark:border-gray-800 border-y'>
            <TableRow>
              <TableCell isHeader className='py-3 w-10'>
                <input
                  type='checkbox'
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer'
                />
              </TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[35%]'>Event</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap min-w-[160px]'>Date & Time</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[140px]'>Location</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap'>Participants</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap'>Type</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap'>Status</TableCell>
              <TableCell isHeader className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap'>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {data.length > 0 ? (
              data.map(event => (
                <TableRow
                  key={event.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  onClick={() => handleViewDetails(event.id)}
                >
                  <TableCell className='py-4 w-10'>
                    <input
                      type='checkbox'
                      checked={selectedIds.has(event.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(event.id)}
                      className='h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer'
                    />
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md'>
                        <Image
                          src={event.image || '/images/placeholder-event.jpg'}
                          alt={event.title}
                          className='object-cover'
                          fill
                          sizes='48px'
                        />
                      </div>
                      <div>
                        <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                          {event.title}
                        </p>
                        <p className='text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1'>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 text-gray-500 text-theme-sm dark:text-gray-400 min-w-[160px]'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='whitespace-nowrap'>{formatDate(event.startDateTime)}</span>
                      <span className='text-xs text-gray-400 whitespace-nowrap'>
                        → {formatDate(event.endDateTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {event.location?.address || 'N/A'}
                  </TableCell>
                  <TableCell className='py-4 text-gray-500 text-theme-sm dark:text-gray-400'>
                    <div className='flex items-center gap-1'>
                      <span>{event.participants?.length || 0}</span>
                      <span className='text-gray-400'>/</span>
                      <span>{event.numberOfParticipants || '∞'}</span>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <Badge
                      size='sm'
                      color={event.type === 'paid' ? 'success' : 'primary'}
                    >
                      {event.type?.charAt(0).toUpperCase() +
                        event.type?.slice(1) || 'Free'}
                      {event.type === 'paid' &&
                        event.price &&
                        ` ($${parseFloat(event.price).toFixed(2)})`}
                    </Badge>
                  </TableCell>
                  <TableCell className='py-4'>
                    <Badge size='sm'>
                      {event.visibility?.charAt(0).toUpperCase() +
                        event.visibility?.slice(1) || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex gap-2' onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/dashboard/events/edit/${event.id}`)}
                        className='px-3 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => duplicateEvent(event.id)}
                        className='px-3 py-1 text-xs border border-gray-400 text-gray-600 rounded hover:bg-gray-50'
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className='px-3 py-1 text-xs border border-red-500 text-red-600 rounded hover:bg-red-50'
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className='py-12 text-center'>
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <svg
                      className='h-12 w-12 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <p className='text-gray-500 dark:text-gray-400'>
                      No events found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className='flex items-center justify-between mt-4'>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          <div className='flex gap-1'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1 || loading
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
              }`}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show first page, last page, and pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (i === 3 && currentPage < totalPages - 3) {
                return (
                  <span key='ellipsis' className='px-3 py-1'>
                    ...
                  </span>
                );
              }

              if (i === 4 && currentPage < totalPages - 3) {
                return (
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === totalPages
                        ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {totalPages}
                  </button>
                );
              }

              if (i > 3 && currentPage >= totalPages - 3) {
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === pageNum
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
                  } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages || loading
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
