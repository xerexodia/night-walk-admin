import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

interface TopProduct {
  name: string;
  sales: number;
}

function HorizontalBarChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}products/admin/top-products`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        setTopProducts(response.data);
      } catch (err) {
        console.error('Error fetching top products:', err);
        setError('Failed to load top products data');
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const options: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 580,
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    colors: ['#426fb7'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '55%',
        dataLabels: {
          position: 'center',
        },
      },
    },
    xaxis: {
      categories: topProducts.map(product => product.name),
      position: 'bottom',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: (value: string) => {
          // Truncate long product names if needed
          return value.length > 20 ? `${value.substring(0, 20)}...` : value;
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        maxWidth: 200,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} units sold`,
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 400,
          },
          dataLabels: {
            enabled: false,
          },
        },
      },
    ],
  };

  const series = [
    {
      name: 'Units Sold',
      data: topProducts.map(product => product.sales),
    },
  ];

  if (loading) {
    return (
      <div className='h-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
        <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
          <div className='w-full'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
              Top Products by Sales
            </h3>
            <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
              Loading product data...
            </p>
          </div>
        </div>
        <div className='h-[350px] flex items-center justify-center'>
          <div className='animate-pulse text-gray-500'>Loading chart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
        <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
          <div className='w-full'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
              Top Products by Sales
            </h3>
            <p className='mt-1 text-red-500 text-theme-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
      <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Top Products by Sales
          </h3>
          <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
            Best performing products
          </p>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto custom-scrollbar'>
        <div className='min-w-[600px] xl:min-w-full'>
          <ReactApexChart
            options={options}
            series={series}
            type='bar'
            height={350}
          />
        </div>
      </div>
    </div>
  );
}

export default HorizontalBarChart;
