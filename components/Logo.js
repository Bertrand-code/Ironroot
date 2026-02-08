import React from 'react';

export default function Logo({ className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
        <path
          d="M24 4L38 10V22c0 11-6.5 18-14 22C16.5 40 10 33 10 22V10L24 4Z"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path d="M24 14v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 20c-6 2-8 6-8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 20c6 2 8 6 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 30l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 30l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
