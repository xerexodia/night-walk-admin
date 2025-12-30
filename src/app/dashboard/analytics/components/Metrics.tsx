import { useEffect, useState } from 'react';
import axios from 'axios';

interface PlatformMetrics {
  totalSales: number;
  totalRevenue: number;
  netRevenue: number;
  conversionRate: number;
}

export default function PlatformMetricsDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}products/admin/platform`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        setMetrics(response.data);
      } catch (err) {
        setError('Failed to load platform metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading)
    return <div className='text-center py-8'>Loading metrics...</div>;
  if (error)
    return <div className='text-center py-8 text-red-500'>{error}</div>;
  if (!metrics)
    return <div className='text-center py-8'>No metrics data available</div>;

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  return (
    <div className='col-span-12 space-y-6 xl:col-span-12'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6'>
        {/* Total Sales */}
        <div className='flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-end justify-between'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Total Sales
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {formatNumber(metrics.totalSales)}
              </h4>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className='flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-end justify-between'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Total Revenue
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {formatCurrency(metrics.totalRevenue)}
              </h4>
            </div>
          </div>
        </div>

        {/* Net Revenue */}
        <div className='flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-end justify-between'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Net Revenue
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {formatCurrency(metrics.netRevenue)}
              </h4>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-end justify-between'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Comission
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {metrics.conversionRate}%
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
