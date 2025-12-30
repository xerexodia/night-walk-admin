import React from 'react';

const page = () => {
  return (
    <div className='flex flex-col md:px-0 my-5 px-10 md:w-1/2 self-center flex-1 items-center justify-center w-full overflow-y-auto no-scrollbar'>
       <div>
         <h3 className='sm:text-5xl text-3xl text-start'>Application sent!</h3>
        <span className='text-base text-gray-500 text-start'>Your application has been successfully submitted. We will review it and get back to you shortly.</span>
       </div>
    </div>
  );
};

export default page;
