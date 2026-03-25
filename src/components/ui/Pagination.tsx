'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, totalElements, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-4 mt-6 ${className}`}>
      <p className="text-sm text-stone-500">
        Page {page + 1} of {totalPages}
        <span className="hidden sm:inline"> · {totalElements} total</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i).map((p) => {
            const isCurrentPage = p === page;
            const isNearCurrent = Math.abs(p - page) <= 1;
            const isEndPage = p === 0 || p === totalPages - 1;

            if (!isNearCurrent && !isEndPage) {
              if (p === 1 && page > 3) return <span key={p} className="px-1 text-stone-400">…</span>;
              if (p === totalPages - 2 && page < totalPages - 4) return <span key={p} className="px-1 text-stone-400">…</span>;
              if (!isEndPage && !isNearCurrent) return null;
            }

            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${
                  isCurrentPage
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                }`}
                aria-label={`Page ${p + 1}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
