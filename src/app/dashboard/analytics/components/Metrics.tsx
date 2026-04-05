"use client";
import { useEffect, useState } from 'react';

interface PlatformMetrics {
  totalEvents: number;
  totalUsers: number;
  totalCheckIns: number;
  totalParticipations: number;
  freeEvents: number;
  paidEvents: number;
}

export default function PlatformMetricsDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}analytics/overview`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setMetrics(json.data);
      } catch (err) {
        setError('Failed to load platform metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat().format(n);

  const cards = metrics
    ? [
        { label: 'Total Events', value: fmt(metrics.totalEvents) },
        { label: 'Total Users', value: fmt(metrics.totalUsers) },
        { label: 'Total Check-ins', value: fmt(metrics.totalCheckIns) },
        { label: 'Total Participations', value: fmt(metrics.totalParticipations) },
      ]
    : [];

  if (loading)
    return <div className='text-center py-8'>Loading metrics...</div>;
  if (error)
    return <div className='text-center py-8 text-red-500'>{error}</div>;

  return (
    <div className='col-span-12 space-y-6 xl:col-span-12'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6'>
        {cards.map((card) => (
          <div
            key={card.label}
            className='flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'
          >
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {card.label}
            </span>
            <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
              {card.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}
