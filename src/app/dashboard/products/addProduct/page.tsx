'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon } from '@/icons';
import React from 'react';

const options = [
  { value: 'skinCare', label: 'skinCare' },
  { value: 'skinCare', label: 'skinCare' },
  { value: 'skinCare', label: 'skinCare' },
];

const page = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Add Product' />

      <form className='flex flex-col bg-white p-4 rounded-lg shadow-md gap-6'>
        <div>
          <Label>Product Name*</Label>
          <Input type='text' placeholder='I phone' />
        </div>
        <div>
          <Label>Product Description*</Label>
          <TextArea
            placeholder='Describe your product in detail'
            // value={message}
            // onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>
        <div className='flex gap-6 items-start justify-between'>
          <div className='flex-1'>
            <Label>Price ($)*</Label>
            <Input type='number' placeholder='29' />
          </div>
          <div className='flex-1'>
            <Label>Select Input</Label>
            <div className='relative'>
              <Select
                options={options}
                placeholder='Select Option'
                onChange={()=>{}}
                className='dark:bg-dark-900'
              />
              <span className='absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400'>
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>
        <div>
          <Label>Product Image*</Label>
          <FileInput
            //  onChange={handleFileChange}
            className='custom-class'
          />
        </div>
        <div className='w-4/5 py-[0.5px] bg-gray-200 self-center' />

        <div className='flex items-center gap-6 justify-end'>
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
      </form>
    </div>
  );
};

export default page;
