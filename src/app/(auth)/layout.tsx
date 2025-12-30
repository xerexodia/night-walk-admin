import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full min-h-screen bg-white '>
      <div className='flex flex-col h-screen'>
        <div className='flex-1 flex'>{children}</div>
      </div>
    </div>
  );
}
