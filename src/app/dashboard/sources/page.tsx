'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface ScrapingSource {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  strategy: string;
  lastScrapedAt: string | null;
  lastEventCount: number;
  totalDraftsCreated: number;
  lastRunNotes: string | null;
  createdAt: string;
}

export default function SourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSources = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}scraping-sources`);
      if (res.status === 401) { router.push('/signin'); return; }
      const data = await res.json();
      setSources(data);
    } catch {
      toast.error('Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      const csv = await file.text();
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}scraping-sources/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      toast.success(`Imported ${data.created} source(s) — ${data.skipped} already existed`);
      fetchSources();
    } catch {
      toast.error('Failed to import CSV');
    } finally {
      setIsImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}scraping-sources/${id}/toggle`, { method: 'PATCH' });
      setSources(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    } catch {
      toast.error('Failed to toggle source');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete source "${name}"?`)) return;
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}scraping-sources/${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
      toast.success('Source deleted');
    } catch {
      toast.error('Failed to delete source');
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Event Sources' />

      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-lg font-semibold text-gray-800'>Scraping Sources</h2>
            <p className='text-sm text-gray-500 mt-0.5'>Upload a CSV of event source URLs. The agent runs daily and scrapes each active source.</p>
          </div>
          <div>
            <input ref={fileRef} type='file' accept='.csv' onChange={handleFileUpload} className='hidden' id='csv-upload' />
            <label htmlFor='csv-upload' className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
              {isImporting ? 'Importing...' : '⬆ Upload CSV'}
            </label>
          </div>
        </div>

        <div className='mb-4 bg-gray-50 rounded-md p-3 text-xs text-gray-500'>
          <strong>CSV format:</strong> One URL per row, or <code>name,url</code> format. Header row is optional.
        </div>

        {isLoading ? (
          <p className='text-gray-500 text-center py-8'>Loading sources...</p>
        ) : sources.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 mb-2'>No sources added yet.</p>
            <p className='text-gray-400 text-sm'>Upload a CSV file to get started.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Source</th>
                  <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Strategy</th>
                  <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Last Run</th>
                  <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Events Found</th>
                  <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Total Drafts</th>
                  <th className='text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide'>Active</th>
                  <th className='py-3 px-4'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {sources.map(source => (
                  <tr key={source.id} className='hover:bg-gray-50'>
                    <td className='py-3 px-4'>
                      <div className='font-medium text-gray-800'>{source.name}</div>
                      <a href={source.url} target='_blank' rel='noreferrer' className='text-xs text-blue-500 hover:underline truncate block max-w-xs'>
                        {source.url}
                      </a>
                    </td>
                    <td className='py-3 px-4'>
                      <span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono'>{source.strategy}</span>
                    </td>
                    <td className='py-3 px-4 text-gray-500'>{formatDate(source.lastScrapedAt)}</td>
                    <td className='py-3 px-4 text-right font-medium'>{source.lastEventCount}</td>
                    <td className='py-3 px-4 text-right text-gray-600'>{source.totalDraftsCreated}</td>
                    <td className='py-3 px-4 text-center'>
                      <button
                        onClick={() => handleToggle(source.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${source.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${source.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <button onClick={() => handleDelete(source.id, source.name)} className='text-red-400 hover:text-red-600 text-xs'>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
