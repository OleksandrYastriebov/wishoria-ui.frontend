import { cn } from '../../utils/cn';

interface ImageFallbackProps {
  src?: string | null;
  alt: string;
  initials?: string;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const gradients: [string, string][] = [
  ['from-violet-400', 'to-purple-600'],
  ['from-blue-400', 'to-indigo-600'],
  ['from-emerald-400', 'to-teal-600'],
  ['from-amber-400', 'to-orange-600'],
  ['from-pink-400', 'to-rose-600'],
  ['from-sky-400', 'to-cyan-600'],
];

function pickGradient(seed: string): [string, string] {
  const idx = (seed.charCodeAt(0) ?? 0) % gradients.length;
  return gradients[idx] ?? ['from-violet-400', 'to-purple-600'];
}

export function ImageFallback({
  src,
  alt,
  initials,
  className,
}: ImageFallbackProps) {
  const [from, to] = pickGradient(alt);
  const displayInitials = initials ?? alt.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = parent.querySelector('[data-fallback]') as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }
          }}
        />
        <div
          data-fallback
          className={cn(
            'absolute inset-0 hidden items-center justify-center bg-gradient-to-br',
            from,
            to
          )}
        >
          <span className="text-white font-bold text-2xl">{displayInitials}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br',
        from,
        to,
        className
      )}
      aria-label={alt}
    >
      <span className="text-white font-bold text-2xl select-none">{displayInitials}</span>
    </div>
  );
}
