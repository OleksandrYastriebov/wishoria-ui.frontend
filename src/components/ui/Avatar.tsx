'use client';

import Image from 'next/image';
import { cn } from '../../utils/cn';
import { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

const colorPalette = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-rose-500',
];

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0]?.toUpperCase() ?? '';
  const l = lastName?.[0]?.toUpperCase() ?? '';
  return f + l || '?';
}

function getColor(firstName?: string, lastName?: string): string {
  const name = (firstName ?? '') + (lastName ?? '');
  const idx = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[idx] ?? 'bg-violet-500';
}

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (src && !imageError) {
    return (
      <div className={cn('relative rounded-full flex-shrink-0 overflow-hidden', sizeClass, className)}>
        <Image
          src={src}
          alt={`${firstName ?? ''} ${lastName ?? ''}`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  const initials = getInitials(firstName, lastName);
  const color = getColor(firstName, lastName);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold select-none',
        sizeClass,
        color,
        className
      )}
      aria-label={`${firstName ?? ''} ${lastName ?? ''}`}
    >
      {initials}
    </div>
  );
}
