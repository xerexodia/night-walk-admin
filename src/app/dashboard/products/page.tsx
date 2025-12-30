import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ProductsTable from '@/components/ecommerce/ProductsTable';
// import { BoxIcon } from '@/icons';
// import Link from 'next/link';
import React from 'react';

const page = () => {
  return (
    <div className='flex gap-6 flex-col'>
      <div className='flex items-center justify-between'>
        <PageBreadcrumb pageTitle='Products' />
        {/* <Link
              className='px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300'
              href={"/addProduct"}
              >
              <BoxIcon />
              <span>Add Product</span>
            </Link> */}
      </div>
      <ProductsTable />
    </div>
  );
};

export default page;
