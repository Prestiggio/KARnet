import React from 'react';

export function Button({ onClick, children, className }: { onClick: any, children: any, className?: string }) {
  return <button onClick={onClick}
    type="button"
    className={`relative inline-flex items-center bg-blue-200! px-3! py-2! text-sm font-semibold text-gray-900! ring-1! ring-inset! ring-gray-300! hover:bg-gray-50! focus:z-10 ${className ?? ''}`}
  >
    {children}
  </button>
}
