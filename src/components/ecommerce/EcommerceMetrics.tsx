'use client';
import React, { useEffect, useState } from 'react';
// import Badge from '../ui/badge/Badge';
import {
  // ArrowDownIcon,
  // ArrowUpIcon,
  BoxCubeIcon,
  BoxIconLine,
  // DollarLineIcon,
  // GroupIcon,
} from '@/icons';

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    pendingUsers: 0,
    rejectedUsers: 0,
    activeProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}users/admin/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.data);
    };
    fetchData();
  }, []);
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6'>
        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Active products
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.activeProducts ?? 0}
              </h4>
            </div>
            {/* <Badge color='success'>
              <ArrowUpIcon />
              11.01%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxIconLine className='text-gray-800 dark:text-white/90' />
          </div>
          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Pending products
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.pendingProducts ?? 0}
              </h4>
            </div>

            {/* <Badge color='error'>
              <ArrowDownIcon className='text-error-500' />
              9.05%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 dark:text-white/90' />
          </div>
          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Rejected products
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.rejectedProducts ?? 0}
              </h4>
            </div>

            {/* <Badge color='error'>
              <ArrowDownIcon className='text-error-500' />
              6.05%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item End --> */}
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6'>
        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Active Users
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.activeUsers ?? 0}
              </h4>
            </div>
            {/* <Badge color='success'>
              <ArrowUpIcon />
              11.01%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxIconLine className='text-gray-800 dark:text-white/90' />
          </div>
          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Pending users
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.pendingUsers ?? 0}
              </h4>
            </div>

            {/* <Badge color='error'>
              <ArrowDownIcon className='text-error-500' />
              9.05%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
          <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
            <BoxCubeIcon className='text-gray-800 dark:text-white/90' />
          </div>
          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Rejected users
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {stats.rejectedUsers ?? 0}
              </h4>
            </div>

            {/* <Badge color='error'>
              <ArrowDownIcon className='text-error-500' />
              6.05%
            </Badge> */}
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item End --> */}
      </div>
    </div>
  );
};
