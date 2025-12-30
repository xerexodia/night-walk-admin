'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import PlatformMetricsDashboard from './components/Metrics';
import StatisticsChart from './components/Monthly';
import HorizontalBarChart from './components/TopProducts';

const page = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Analytics' />
      <div className='grid grid-cols-12 gap-4 md:gap-6'>
        <PlatformMetricsDashboard />

        <div className='col-span-12'>
          <StatisticsChart />
        </div>
        <div className='col-span-12'>
          <HorizontalBarChart />
        </div>

        {/* <div className='col-span-12 xl:col-span-12 flex flex-col xl:flex-row gap-4'>
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
          <div className='flex-1'>
            <DonutStatisticsChart />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default page;
