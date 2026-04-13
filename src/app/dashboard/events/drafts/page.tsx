'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface DraftEvent {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  title: string;
  description: string;
  imageUrl: string | null;
  venueName: string | null;
  location: { address: string; latitude: number | null; longitude: number | null } | null;
  startDateTime: string | null;
  endDateTime: string | null;
  type: 'free' | 'paid';
  price: number | null;
  visibility: string;
  socialLinks: { instagram?: string; spotify?: string; website?: string } | null;
  categoriesIds: string[] | null;
  sourceUrl: string | null;
  agentNotes: string | null;
  endTimeEstimated: boolean;
  descriptionGenerated: boolean;
  scrapingSource: { name: string; url: string } | null;
  createdAt: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const fmt = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selected, setSelected] = useState<DraftEvent | null>(null);
  const [isActing, setIsActing] = useState(false);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}draft-events${query}`);
      if (res.status === 401) { router.push('/signin'); return; }
      const data = await res.json();
      setDrafts(data);
    } catch {
      toast.error('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, [statusFilter]);

  const handleApprove = async (draft: DraftEvent) => {
    setIsActing(true);
    try {
      // 1. Approve the draft (mark as approved)
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}draft-events/${draft.id}/approve`, { method: 'PATCH' });

      // 2. Create the live event via FormData
      const body = new FormData();
      body.append('title', draft.title);
      body.append('description', draft.description);
      body.append('type', draft.type);
      if (draft.type === 'paid' && draft.price) body.append('price', String(draft.price));
      if (draft.startDateTime) body.append('startDateTime', new Date(draft.startDateTime).toISOString());
      if (draft.endDateTime) body.append('endDateTime', new Date(draft.endDateTime).toISOString());
      body.append('visibility', draft.visibility || 'public');
      if (draft.location) body.append('location', JSON.stringify(draft.location));
      if (draft.venueName) body.append('venueName', draft.venueName);
      if (draft.categoriesIds?.length) body.append('categoriesIds', JSON.stringify(draft.categoriesIds));
      if (draft.socialLinks) body.append('socialLinks', JSON.stringify(draft.socialLinks));
      if (draft.imageUrl) body.append('imageUrl', draft.imageUrl);

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}events`, { method: 'POST', body });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create live event');
      }

      toast.success(`✅ "${draft.title}" is now live!`);
      setSelected(null);
      fetchDrafts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async (draft: DraftEvent) => {
    if (!confirm(`Reject "${draft.title}"?`)) return;
    setIsActing(true);
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}draft-events/${draft.id}/reject`, { method: 'PATCH' });
      toast.success('Draft rejected');
      setSelected(null);
      fetchDrafts();
    } catch {
      toast.error('Failed to reject draft');
    } finally {
      setIsActing(false);
    }
  };

  const handleEditAndApprove = (draft: DraftEvent) => {
    // Store draft data in sessionStorage and open edit form
    sessionStorage.setItem('draftToEdit', JSON.stringify(draft));
    router.push(`/dashboard/events/addEvent?fromDraft=${draft.id}`);
  };

  const pendingCount = drafts.filter(d => d.status === 'pending').length;

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Event Drafts' />

      {/* Filter tabs */}
      <div className='flex gap-2'>
        {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {s} {s === 'pending' && pendingCount > 0 && statusFilter !== 'pending' ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {isLoading ? (
          <p className='text-center py-12 text-gray-500'>Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <div className='text-center py-16'>
            <p className='text-gray-500 text-lg'>No {statusFilter !== 'all' ? statusFilter : ''} drafts</p>
            <p className='text-gray-400 text-sm mt-1'>
              {statusFilter === 'pending' ? 'Run the agent or wait for the daily scrape.' : 'Nothing to show here.'}
            </p>
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50'>
                <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Event</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Date</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Venue</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Source</th>
                <th className='text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Type</th>
                <th className='text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Status</th>
                <th className='py-3 px-4'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {drafts.map(draft => (
                <tr key={draft.id} className='hover:bg-gray-50 cursor-pointer' onClick={() => setSelected(draft)}>
                  <td className='py-3 px-4'>
                    <div className='font-medium text-gray-800 line-clamp-1'>{draft.title}</div>
                    {draft.agentNotes && <div className='text-xs text-amber-600 mt-0.5'>⚠️ {draft.agentNotes}</div>}
                  </td>
                  <td className='py-3 px-4 text-gray-600 whitespace-nowrap'>{fmt(draft.startDateTime)}</td>
                  <td className='py-3 px-4 text-gray-600'>{draft.venueName || draft.location?.address?.split(',')[0] || '—'}</td>
                  <td className='py-3 px-4 text-gray-500 text-xs'>{draft.scrapingSource?.name || '—'}</td>
                  <td className='py-3 px-4 text-center'>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${draft.type === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {draft.type === 'paid' ? `$${draft.price}` : 'Free'}
                    </span>
                  </td>
                  <td className='py-3 px-4 text-center'>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[draft.status]}`}>
                      {draft.status}
                    </span>
                  </td>
                  <td className='py-3 px-4 text-right'>
                    {draft.status === 'pending' && (
                      <div className='flex gap-2 justify-end' onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleApprove(draft)} disabled={isActing} className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50'>Approve</button>
                        <button onClick={() => handleEditAndApprove(draft)} disabled={isActing} className='px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50'>Edit</button>
                        <button onClick={() => handleReject(draft)} disabled={isActing} className='px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 disabled:opacity-50'>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-end' onClick={() => setSelected(null)}>
          <div className='bg-white h-full w-full max-w-2xl overflow-y-auto p-8 shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex items-start justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900 pr-4'>{selected.title}</h2>
              <button onClick={() => setSelected(null)} className='text-gray-400 hover:text-gray-600 text-2xl leading-none'>×</button>
            </div>

            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} className='w-full h-48 object-cover rounded-lg mb-6' />
            )}

            <div className='space-y-4 text-sm'>
              <Row label='Status'>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              </Row>
              <Row label='Date'>{fmt(selected.startDateTime)}{selected.endTimeEstimated && <span className='ml-2 text-xs text-amber-500'>(end time estimated)</span>}</Row>
              <Row label='End'>{fmt(selected.endDateTime)}</Row>
              <Row label='Venue'>{selected.venueName || '—'}</Row>
              <Row label='Address'>{selected.location?.address || '—'}</Row>
              <Row label='Type'><span className='capitalize'>{selected.type}</span> {selected.price ? `— $${selected.price}` : ''}</Row>
              <Row label='Visibility'><span className='capitalize'>{selected.visibility}</span></Row>
              <Row label='Categories'>{selected.categoriesIds?.join(', ') || '—'}</Row>
              <Row label='Ticket URL'>
                {selected.socialLinks?.website
                  ? <a href={selected.socialLinks.website} target='_blank' rel='noreferrer' className='text-blue-500 hover:underline truncate block'>{selected.socialLinks.website}</a>
                  : '—'}
              </Row>
              <Row label='Instagram'>{selected.socialLinks?.instagram || '—'}</Row>
              <Row label='Spotify'>{selected.socialLinks?.spotify || '—'}</Row>
              <Row label='Source'>
                {selected.sourceUrl
                  ? <a href={selected.sourceUrl} target='_blank' rel='noreferrer' className='text-blue-500 hover:underline'>{selected.scrapingSource?.name || selected.sourceUrl}</a>
                  : '—'}
              </Row>
              {selected.agentNotes && (
                <div className='bg-amber-50 border border-amber-200 rounded-md p-3'>
                  <p className='text-xs font-medium text-amber-700 mb-1'>Agent Notes</p>
                  <p className='text-sm text-amber-800'>{selected.agentNotes}</p>
                </div>
              )}
              {selected.descriptionGenerated && (
                <div className='bg-blue-50 border border-blue-200 rounded-md p-2'>
                  <p className='text-xs text-blue-600'>ℹ️ Description was generated by AI (not from source page)</p>
                </div>
              )}
              <div>
                <p className='text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide'>Description</p>
                <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>{selected.description}</p>
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className='flex gap-3 mt-8 pt-6 border-t border-gray-200'>
                <button onClick={() => handleApprove(selected)} disabled={isActing} className='flex-1 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50'>
                  {isActing ? 'Processing...' : '✅ Approve & Go Live'}
                </button>
                <button onClick={() => handleEditAndApprove(selected)} disabled={isActing} className='flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50'>
                  ✏️ Edit then Approve
                </button>
                <button onClick={() => handleReject(selected)} disabled={isActing} className='px-4 py-2.5 bg-red-100 text-red-600 font-medium rounded-md hover:bg-red-200 disabled:opacity-50'>
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex gap-4'>
      <span className='w-28 shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5'>{label}</span>
      <span className='text-gray-800 flex-1'>{children}</span>
    </div>
  );
}
