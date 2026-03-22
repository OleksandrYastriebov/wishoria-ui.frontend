'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses = {
  primary:
    'bg-amber-500 text-white hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-500 focus-visible:ring-offset-[#fefdf8] disabled:bg-amber-200 disabled:text-amber-400 shadow-sm shadow-amber-500/30',
  secondary:
    'bg-white/60 backdrop-blur-sm text-stone-700 border border-white/70 hover:bg-white/80 active:bg-white/90 focus-visible:ring-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.06)] disabled:opacity-40',
  ghost:
    'bg-transparent text-stone-500 hover:bg-black/[0.05] hover:text-stone-900 active:bg-black/[0.08] focus-visible:ring-amber-400 disabled:opacity-40',
  danger:
    'bg-red-500 text-white hover:bg-red-400 active:bg-red-600 focus-visible:ring-red-500 focus-visible:ring-offset-[#fefdf8] disabled:bg-red-200 disabled:text-red-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0"
            aria-hidden="true"
          />
          {children}
        </span>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
