// components/Icon.tsx
import React from 'react';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  fill?: boolean;
  variant?: 'outlined' | 'rounded' | 'sharp';
  className?: string;
}

export const Icon = ({
  name,
  size = 'md',
  weight = 400,
  fill = false,
  variant = 'outlined',
  className = '',
}: IconProps) => {
  const sizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <span
      className={`material-symbols-${variant} ${sizeMap[size]} ${className}`}
      style={{
        fontVariationSettings: `'wght' ${weight}, 'FILL' ${fill ? 1 : 0}`,
      }}
    >
      {name}
    </span>
  );
};