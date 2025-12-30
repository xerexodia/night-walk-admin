import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Stats from '@/components/users/stats/Stats'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col gap-6'>
        <PageBreadcrumb 
          pageTitle='User Stats'
        />
        <Stats />
    </div>
  )
}

export default page