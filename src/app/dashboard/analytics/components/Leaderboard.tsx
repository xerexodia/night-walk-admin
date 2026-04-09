"use client";
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface LeaderEntry {
  rank: number;
  name: string;
  email: string;
  points: number;
  checkInCount: number;
  tier: string;
}

const tierColors: Record<string, string> = {
  Diamond: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  Platinum: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  Gold: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  Silver: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  Bronze: 'text-orange-400 bg-orange-50 dark:bg-orange-900/20',
};

export default function Leaderboard() {
  const [data, setData] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}analytics/leaderboard?limit=8`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        const res = await r.json();
        setData(res.data ?? []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">🏆 XP Leaderboard</h3>
      <div className="space-y-2">
        {data.length === 0 && (
          <>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />)}</>
        )}
        {data.map((u) => (
          <div key={u.email} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03]">
            <span className={`text-sm font-bold w-6 text-center ${u.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
              {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-white/80 truncate">{u.name}</p>
              <p className="text-xs text-gray-400 truncate">{u.checkInCount} check-ins</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColors[u.tier] ?? tierColors.Bronze}`}>{u.tier}</span>
            <span className="text-sm font-bold text-indigo-500">{u.points.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
