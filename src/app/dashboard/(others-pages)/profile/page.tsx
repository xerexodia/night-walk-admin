import Button from '@/components/ui/button/Button';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '',
  description: '',
};

export default function Profile() {
  return (
    <div>
      <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
        <h3 className='mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7'>
          Profile Settings
        </h3>
        <div className='space-y-6'>
          <UserMetaCard />
        </div>
      </div>
      <div className='flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-5 dark:border-red-800 dark:bg-white/[0.03] lg:p-6 mt-6 shadow shadow-red-200'>
        <span className='text-red-700 text-lg'>Danger Zone</span>
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm'>Deactivate Account</span>
            <span className='text-xs text-gray-400'>
              Temporarily disable your account. Your products will be hidden
              from the marketplace.
            </span>
          </div>
          <Button size='md' variant='outline'>
            Deactivate
          </Button>
        </div>
        <div className='py-[0.5px] bg-gray-300 w-full self-center' />
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm'>Delete Account</span>
            <span className='text-xs text-gray-400'>
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </span>
          </div>
          <Button size='md' variant='outline' className='border border-red-600 text-red-600'>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
