"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

export default function Monthly() {
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}analytics/monthly`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const data = res.data ?? [];
        setCategories(data.map((d: any) => {
          const [year, month] = d.month.split('-');
          return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
        }));
        setSeries([
          { name: 'Check-ins', data: data.map((d: any) => d.checkIns) },
          { name: 'Attendances', data: data.map((d: any) => d.attendances) },
          { name: 'New Users', data: data.map((d: any) => d.signups) },
        ]);
      })
      .catch(() => {});
  }, []);

  const options: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#6366f1', '#f59e0b', '#10b981'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories, labels: { style: { colors: '#9ca3af', fontSize: '12px' } } },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    legend: { position: 'top', labels: { colors: '#9ca3af' } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Monthly Activity</h3>
      {series.length > 0
        ? <ReactApexChart options={options} series={series} type="area" height={280} />
        : <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
      }
    </div>
  );
}
