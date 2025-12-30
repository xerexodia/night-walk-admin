'use client';
import React, { useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { ArrowUpIcon, BoxCubeIcon, DollarLineIcon } from '@/icons';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import ChartTab from '@/components/common/ChartTab';
import UserProductTable from '@/components/ecommerce/UserProductTable';
import { useParams } from 'next/navigation';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const Stats = () => {
  const [stats, setStats] = React.useState({
    approvedCount: 0,
    pendingCount: 0,
  });
  const { id } = useParams();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}products/products-stats/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setStats(data.data);
      })
      .catch(error => {
        console.error('Error fetching user stats:', error);
      });
  }, [id]);
  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Online Products
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.approvedCount}
              </h4>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Pending Products
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.pendingCount}
              </h4>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <DollarLineIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Revenu
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                $342,782
              </h4>
            </div>
            <Badge color='success'>
              <ArrowUpIcon />
              31.01%
            </Badge>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Sales
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                3,782
              </h4>
            </div>
            <Badge color='success'>
              <ArrowUpIcon />
              11.01%
            </Badge>
          </div>
        </div>
      </div>
      <UserProductTable />

      <div className='col-span-12'>
        <StatisticsChart />
      </div>

      <div className='col-span-12 xl:col-span-12 flex flex-col xl:flex-row gap-4'>
        <div className='flex-1'>
          <HorizentalBarChart />
        </div>
        <div className='flex-1'>
          <DonutStatisticsChart />
        </div>
      </div>
      <div className='col-span-12 xl:col-span-12 flex flex-col xl:flex-row gap-4'>
        <div className='flex-1'>
          <MonthlySalesTrendChart />
        </div>
      </div>
    </div>
  );
};

export default Stats;

function StatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#a9a9a9', '#b3b3b3'], // Define line colors
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 310,
      type: 'line', // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: 'straight', // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: '#fff', // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        format: 'dd MMM yyyy', // Format for x-axis tooltip
      },
    },
    xaxis: {
      type: 'category', // Category-based x-axis
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
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px', // Adjust font size for y-axis labels
          colors: ['#6B7280'], // Color of the labels
        },
      },
      title: {
        text: '', // Remove y-axis title
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  const series = [
    {
      name: 'Sales',
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: 'Revenue',
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];
  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
      <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Sales Over Time
          </h3>
        </div>
        <div className='flex items-start w-full gap-3 sm:justify-end'>
          <ChartTab />
        </div>
      </div>

      <div className='max-w-full overflow-x-auto custom-scrollbar'>
        <div className='min-w-[1000px] xl:min-w-full'>
          <ReactApexChart
            options={options}
            series={series}
            type='area'
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

function DonutStatisticsChart() {
  const pieOptions: ApexOptions = {
    chart: {
      type: 'pie',
      fontFamily: 'Outfit, sans-serif',
    },
    labels: ['Skincare', 'Makeup', 'Fragrances', 'Bodycare', 'Haircare'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      itemMargin: {
        horizontal: 18,
        vertical: 4,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: false,
      },
      formatter: function (val, opts) {
        return opts.w.config.labels[opts.seriesIndex];
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '0%', // This makes it a full pie by removing the donut hole
        },
        customScale: 1,
        offsetX: 0,
        offsetY: 0,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: function (value) {
          return '$' + value.toLocaleString();
        },
      },
    },
  };

  const pieSeries = [4500, 3200, 2100, 1500, 1200]; // Sample revenue data

  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
          Revenue by Category
        </h3>
        <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
          Distribution across product categories
        </p>
      </div>
      <div className='flex justify-center'>
        <ReactApexChart
          options={pieOptions}
          series={pieSeries}
          type='pie'
          height={400}
        />
      </div>
      <div className='mt-4 text-center text-sm text-gray-500 dark:text-gray-400'>
        Total Revenue: $12,500
      </div>
    </div>
  );
}

function HorizentalBarChart() {
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
      categories: [
        'iPhone 15 Pro Max',
        'MacBook Pro 14"',
        'AirPods Pro 2',
        'iPad Pro',
        'Apple Watch Ultra',
      ],
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
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        maxWidth: 200, // Ensure product names don't get cut off
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
      data: [1245, 987, 856, 732, 689],
    },
  ];

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

function MonthlySalesTrendChart() {
  const options: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ['#426fb7', '#0a825a'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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
      },
    },
    yaxis: {
      title: {
        text: 'Sales (units)',
        style: {
          color: '#6B7280',
          fontSize: '12px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString() + ' units';
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: {},
      itemMargin: {
        horizontal: 15,
        vertical: 0,
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 400,
          },
          plotOptions: {
            bar: {
              columnWidth: '45%',
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: 'Actual Sales',
      data: [1250, 1300, 1420, 1380, 1470, 1530],
    },
    {
      name: 'Target Sales',
      data: [1200, 1250, 1350, 1400, 1450, 1500],
    },
  ];

  return (
    <div className='h-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6'>
      <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Monthly Sales Trend
          </h3>
          <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
            Actual vs Target sales performance
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
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}
