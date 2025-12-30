/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';

function StatisticsChart() {
  const [series, setSeries] = useState([
    { name: 'Sales', data: Array(12).fill(0) },
    { name: 'Revenue', data: Array(12).fill(0) },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}products/admin/monthly`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        const { sales, revenue } = response.data;

        setSeries([
          { name: 'Sales', data: sales },
          { name: 'Revenue', data: revenue },
        ]);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3b82f6', '#10b981'], // Blue for sales, green for revenue
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 310,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6,
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
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number, { seriesIndex }: { seriesIndex: any }) => {
          return seriesIndex === 0
            ? `${value} sales`
            : `$${value.toLocaleString()}`;
        },
      },
    },
    xaxis: {
      type: 'category',
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#6B7280'],
        },
        formatter: (value: number) => {
          return value >= 1000 ? `${value / 1000}k` : value;
        },
      },
      title: {
        text: '',
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]'>
        <div className='h-[310px] flex items-center justify-center'>
          <div className='animate-pulse text-gray-500'>
            Loading chart data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
      <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Sales Over Time
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Monthly sales and revenue for {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto custom-scrollbar'>
        <div className='min-w-[1000px] xl:min-w-full'>
          <ReactApexChart
            options={options as any}
            series={series}
            type='area'
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

export default StatisticsChart;
