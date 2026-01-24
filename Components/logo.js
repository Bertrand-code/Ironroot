import React from 'react';

export default function Logo({ className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
            <rect x="4" y="4" width="28" height="28" stroke="currentColor" strokeWidth="2.5" fill="none" rx="3"/>
            <path d="M18 12L23 16V24L18 28L13 24V16L18 12Z" fill="currentColor"/>
            <path d="M12 9L18 14L24 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="20" r="1.5" fill="#DC2626"/>
        </svg>
    </div>
  );
}