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
    'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700 focus-visible:ring-violet-500 focus-visible:ring-offset-[#08080e] disabled:bg-violet-900 disabled:text-violet-400',
  secondary:
    'bg-white/[0.07] text-[#c8c8da] hover:bg-white/[0.12] active:bg-white/[0.15] focus-visible:ring-white/30 disabled:opacity-40',
  ghost:
    'bg-transparent text-[#9898b4] hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1] focus-visible:ring-white/30 disabled:opacity-40',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-[#08080e] disabled:bg-red-900 disabled:text-red-400',
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
        'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none',
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
