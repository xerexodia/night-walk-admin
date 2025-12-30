'use client';
import React from 'react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Image from 'next/image';
import TextArea from '../form/input/TextArea';

export default function UserMetaCard() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Personal Information
          </h4>

          <div className='flex gap-4'>
            <div className='flex flex-col gap-2 items-center'>
              <div className='w-32 h-32 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800'>
                <Image
                  width={200}
                  height={200}
                  src='/images/user/owner.jpg'
                  alt='user'
                />
              </div>
              <span className='text-sm text-gray-400'>Change Photo</span>
            </div>
            <div className='flex flex-col gap-4 flex-1'>
              <div className='flex flex-1 gap-4 flex-wrap'>
                <div className='flex-1'>
                  <Label>Brand/Creator Name</Label>
                  <Input type='text' placeholder='Brand/Creator Name' />
                </div>
                <div className='flex-1'>
                  <Label>Display Name</Label>
                  <Input type='text' placeholder='Sarah Johnson' />
                </div>
              </div>
              <div className='flex flex-1 gap-4 flex-wrap'>
                <div className='flex-1'>
                  <Label>Email Address</Label>
                  <Input type='text' placeholder='sarahbeauty@example.com' />
                </div>
                <div className='flex-1'>
                  <Label>Phone Number</Label>
                  <Input type='text' placeholder='(555) 123-4567' />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <TextArea
                  placeholder='Creator of handcrafted beauty products using all-natural ingredients. Specializing in skincare for sensitive skin types.'
                  // value={message}
                  // onChange={(value) => setMessage(value)}
                  rows={6}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Business Information
          </h4>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>Business Name</Label>
                <Input type='text' placeholder="Sarah's Beauty LLC" />
              </div>
              <div className='flex-1'>
                <Label>XX-XXXXXXX</Label>
                <Input type='text' placeholder="Sarah's Beauty LLC" />
              </div>
            </div>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>Business Address</Label>
                <Input type='text' placeholder='123 Beauty Lane' />
              </div>
              <div className='flex-1'>
                <Label>City</Label>
                <Input type='text' placeholder='Los Angeles' />
              </div>
            </div>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>State</Label>
                <Input type='text' placeholder='California' />
              </div>
              <div className='flex-1'>
                <Label>ZIP / Postal Code</Label>
                <Input type='text' placeholder='90210' />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Change Password
          </h4>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>Current Password</Label>
                <Input type='text' placeholder='************' />
              </div>
              <div className='flex-1' />
            </div>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>New Password</Label>
                <Input type='text' placeholder='************' />
              </div>
              <div className='flex-1'>
                <Label>Confirm New Password</Label>
                <Input type='text' placeholder='************' />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Social Media Links
          </h4>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>Instagram</Label>
                <Input type='text' placeholder='instagram.com/sarahsbeauty' />
              </div>
              <div className='flex-1'>
                <Label>Instagram</Label>
                <Input
                  type='text'
                  placeholder='youtube.com/SarahsBeautyChannel'
                />
              </div>
            </div>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <Label>TikTok</Label>
                <Input type='text' placeholder='tiktok.com/@sarahsbeauty' />
              </div>
              <div className='flex-1'>
                <Label>Website</Label>
                <Input type='text' placeholder='https://www.sarahsbeauty.com' />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex gap-6 items-center justify-end'>
        <Button size='md' variant='outline'>
          Cancel
        </Button>
        <Button
          size='md'
          className='bg-black text-white hover:bg-gray-600 transition'
        >
          Submit for review
        </Button>
      </div>
    </div>
  );
}
