"use client";
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface TopEvent {
  id: number;
  title: string;
  checkInCount: number;
  attendanceCount: number;
  checkInRate: number;
  type: string;
}

export default function TopEvents() {
  const [data, setData] = useState<TopEvent[]>([]);

  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}analytics/top-events?limit=8`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        const res = await r.json();
        setData(res.data ?? []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Top Events by Check-ins</h3>
      <div className="space-y-3">
        {data.length === 0 && (
          <>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />)}</>
        )}
        {data.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-white/80 truncate">{e.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(e.checkInRate, 100)}%` }} />
                </div>
                <span className="text-xs text-gray-400">{e.checkInRate}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">{e.checkInCount} <span className="text-xs font-normal text-gray-400">check-ins</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
