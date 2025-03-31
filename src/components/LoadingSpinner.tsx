import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2c2420]"></div>
    </div>
  );
}