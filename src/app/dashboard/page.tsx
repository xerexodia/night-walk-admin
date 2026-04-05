import type { Metadata } from 'next';
import Metrics from './analytics/components/Metrics';
import Monthly from './analytics/components/Monthly';
import TopProducts from './analytics/components/TopProducts';

export const metadata: Metadata = {
  title: 'Night Walk — Dashboard',
  description: 'Night Walk admin dashboard',
};

export default function Dashboard() {
  return (
    <div className='grid grid-cols-12 gap-4 md:gap-6'>
      <div className='col-span-12'>
        <Metrics />
      </div>

      <div className='col-span-12 xl:col-span-8'>
        <Monthly />
      </div>

      <div className='col-span-12 xl:col-span-4'>
        <TopProducts />
      </div>
    </div>
  );
}
