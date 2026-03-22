'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { withCloudinaryResize } from '../../utils/cloudinary';

interface ImageFallbackProps {
  src?: string | null;
  alt: string;
  initials?: string;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const gradients: [string, string][] = [
  ['from-amber-100', 'to-orange-200'],
  ['from-blue-100', 'to-indigo-200'],
  ['from-emerald-100', 'to-teal-200'],
  ['from-rose-100', 'to-pink-200'],
  ['from-violet-100', 'to-purple-200'],
  ['from-sky-100', 'to-cyan-200'],
];

function pickGradient(seed: string): [string, string] {
  const idx = (seed.charCodeAt(0) ?? 0) % gradients.length;
  return gradients[idx] ?? ['from-amber-100', 'to-orange-200'];
}

export function ImageFallback({
  src,
  alt,
  className,
}: ImageFallbackProps) {
  const [from, to] = pickGradient(alt);
  const displayInitials = alt.toUpperCase();

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: rect.width, h: rect.height });
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resolvedSrc =
    src && size ? withCloudinaryResize(src, size.w, size.h) : null;

  const showImage = Boolean(resolvedSrc && !imgError);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {showImage && (
        <Image
          src={resolvedSrc!}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br transition-opacity duration-300 gap-2',
          from,
          to,
          showImage ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        aria-hidden={showImage}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-8 h-8 text-stone-400 select-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l1.8 3.6L18 6.6l-3 2.9.7 4.1L12 11.5l-3.7 2.1.7-4.1-3-2.9 4.2-.9z" />
          <path d="M5 22v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />
          <line x1="3" y1="22" x2="21" y2="22" />
        </svg>
        <span className="text-stone-400 text-xs font-medium select-none tracking-widest uppercase">
          {displayInitials}
        </span>
      </div>
    </div>
  );
}
