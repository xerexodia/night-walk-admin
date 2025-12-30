import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Details from '@/components/users/details/Details'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col gap-6'>
        <PageBreadcrumb 
          pageTitle='User Details'
        />
        <Details />
    </div>
  )
}

export default page