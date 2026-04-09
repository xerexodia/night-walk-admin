"use client";
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface CheckIn {
  userName: string;
  email: string;
  eventTitle: string;
  checkedInAt: string;
}

export default function RecentCheckIns() {
  const [data, setData] = useState<CheckIn[]>([]);

  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}analytics/recent-checkins?limit=8`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        const res = await r.json();
        setData(res.data ?? []);
      })
      .catch(() => setData([]));
  }, []);

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">📍 Recent Check-ins</h3>
      <div className="space-y-3">
        {data.length === 0 && (
          <>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />)}</>
        )}
        {data.map((c, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
              {c.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-white/80 truncate">{c.userName}</p>
              <p className="text-xs text-gray-400 truncate">Checked in at <span className="text-indigo-400">{c.eventTitle}</span></p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(c.checkedInAt)}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No check-ins yet</p>}
      </div>
    </div>
  );
}
