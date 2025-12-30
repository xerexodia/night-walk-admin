import type { Metadata } from 'next';
import { EcommerceMetrics } from '@/components/ecommerce/EcommerceMetrics';
import React from 'react';
import MonthlySalesChart from '@/components/ecommerce/MonthlySalesChart';
// import StatisticsChart from '@/components/ecommerce/StatisticsChart';

export const metadata: Metadata = {
  title: '',
  description: '',
};

export default function Ecommerce() {
  return (
    <div className='grid grid-cols-12 gap-4 md:gap-6'>
      <div className='col-span-12 space-y-6 xl:col-span-12'>
        {/* <EcommerceMetrics /> */}
      </div>

      <div className='col-span-12 xl:col-span-12'>
        {/* <MonthlySalesChart /> */}
        {/* <MonthlyTarget /> */}
      </div>

      {/* <div className='col-span-12'>
        <StatisticsChart />
      </div> */}
    </div>
  );
}
