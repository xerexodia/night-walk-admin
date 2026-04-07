"use client";
import { useEffect, useState } from 'react';

interface Overview {
  totalEvents: number;
  activeEventsToday: number;
  totalUsers: number;
  userGrowthPercent: number;
  totalCheckIns: number;
  totalAttendances: number;
  checkInRate: number;
}

const StatCard = ({
  title, value, sub, subPositive, icon, color,
}: {
  title: string; value: string | number; sub?: string;
  subPositive?: boolean; icon: string; color: string;
}) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-0.5">{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${subPositive ? 'text-green-500' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  </div>
);

export default function Metrics() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}analytics/overview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
    }).then((r) => r.json()).then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 h-24 animate-pulse" />
      ))}
    </div>
  );

  const cards = [
    { title: 'Total Events', value: data.totalEvents, sub: `${data.activeEventsToday} happening now`, subPositive: data.activeEventsToday > 0, icon: '🎉', color: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Total Users', value: data.totalUsers.toLocaleString(), sub: data.userGrowthPercent >= 0 ? `+${data.userGrowthPercent}% vs last month` : `${data.userGrowthPercent}% vs last month`, subPositive: data.userGrowthPercent >= 0, icon: '👥', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Check-ins', value: data.totalCheckIns.toLocaleString(), icon: '📍', color: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Total Attendances', value: data.totalAttendances.toLocaleString(), sub: 'Users who clicked Attend', icon: '🎟️', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { title: 'Check-in Rate', value: `${data.checkInRate}%`, sub: 'Attendees who checked in', subPositive: data.checkInRate >= 50, icon: '✅', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Live Now', value: data.activeEventsToday, sub: 'Active events', subPositive: data.activeEventsToday > 0, icon: '🔴', color: 'bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => <StatCard key={c.title} {...c} />)}
    </div>
  );
}
