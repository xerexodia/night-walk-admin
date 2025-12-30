import React from 'react';
import CircularLoader from './CircularLoader';

const FullScreenLoader = () => {
  return (
    <div
      style={{ zIndex: 99999999999999 }}
      className='fixed inset-0 flex items-center justify-center bg-white/70'
    >
      <CircularLoader
        size={48}
        color='black'
        strokeWidth={4}
      />
    </div>
  );
};

export default FullScreenLoader;
