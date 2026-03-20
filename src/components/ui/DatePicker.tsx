'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i);

function formatDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function DatePicker({
  label,
  error,
  hint,
  value,
  onChange,
  name,
  disabled,
  placeholder = 'Select date',
}: DatePickerProps) {
  const parsedDate = useMemo(() => (value ? new Date(value + 'T00:00:00') : null), [value]);

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(parsedDate ?? TODAY);
  const [view, setView] = useState<'calendar' | 'month' | 'year'>('calendar');

  const containerRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll to selected year when year view opens
  useEffect(() => {
    if (view === 'year' && yearListRef.current) {
      const selectedBtn = yearListRef.current.querySelector('[data-selected="true"]');
      if (selectedBtn) {
        (selectedBtn as HTMLElement).scrollIntoView({ block: 'center' });
      }
    }
  }, [view]);

  const openPicker = useCallback(() => {
    if (disabled) return;
    setViewDate(parsedDate ?? TODAY);
    setView('calendar');
    setIsOpen((o) => !o);
  }, [disabled, parsedDate]);

  const handleDayClick = useCallback(
    (day: number) => {
      const y = viewDate.getFullYear();
      const m = viewDate.getMonth();
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange?.(dateStr);
      setIsOpen(false);
    },
    [viewDate, onChange],
  );

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const isSelected = (day: number) =>
    parsedDate?.getUTCDate() === day &&
    parsedDate?.getUTCMonth() === month &&
    parsedDate?.getUTCFullYear() === year;

  const isToday = (day: number) =>
    TODAY.getDate() === day &&
    TODAY.getMonth() === month &&
    TODAY.getFullYear() === year;

  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#c8c8da]">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border text-sm text-left transition-colors flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
            error
              ? 'border-red-500/50 bg-red-500/10 focus:ring-red-500/60'
              : 'border-white/[0.08] bg-white/[0.05] hover:border-white/[0.14]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <span className={value ? 'text-white' : 'text-white/25'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
          <Calendar size={15} className="text-[#55556e] flex-shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-72 rounded-2xl border border-white/[0.08] bg-[#0d0d14] shadow-2xl shadow-black/60 p-3">
            {/* Calendar view */}
            {view === 'calendar' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#9898b4] hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('month')}
                    className="flex items-center gap-1 text-sm font-semibold text-white hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                  >
                    {MONTHS[month]} {year}
                    <ChevronDown size={13} className="text-[#55556e]" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#9898b4] hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-[11px] text-[#55556e] font-medium py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors',
                        isSelected(day)
                          ? 'bg-violet-600 text-white font-semibold'
                          : isToday(day)
                            ? 'border border-violet-500/50 text-violet-400 hover:bg-violet-600/20'
                            : 'text-[#c8c8da] hover:bg-white/[0.08]',
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(null);
                      setIsOpen(false);
                    }}
                    className="mt-3 w-full text-xs text-[#55556e] hover:text-red-400 transition-colors py-1.5 rounded-lg hover:bg-red-500/5"
                  >
                    Clear date
                  </button>
                )}
              </>
            )}

            {/* Month selection view */}
            {view === 'month' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setView('year')}
                    className="flex items-center gap-1 text-sm font-semibold text-white hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                  >
                    {year}
                    <ChevronDown size={13} className="text-[#55556e]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('calendar')}
                    className="text-xs text-[#9898b4] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                  >
                    Back
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS_SHORT.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(year, i, 1));
                        setView('calendar');
                      }}
                      className={cn(
                        'py-2 rounded-xl text-sm transition-colors',
                        i === month
                          ? 'bg-violet-600 text-white font-semibold'
                          : 'text-[#c8c8da] hover:bg-white/[0.08]',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Year selection view */}
            {view === 'year' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white px-2">Select year</span>
                  <button
                    type="button"
                    onClick={() => setView('month')}
                    className="text-xs text-[#9898b4] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                  >
                    Back
                  </button>
                </div>
                <div
                  ref={yearListRef}
                  className="h-52 overflow-y-auto space-y-0.5 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      data-selected={y === year}
                      onClick={() => {
                        setViewDate(new Date(y, month, 1));
                        setView('month');
                      }}
                      className={cn(
                        'w-full py-1.5 rounded-xl text-sm text-center transition-colors',
                        y === year
                          ? 'bg-violet-600 text-white font-semibold'
                          : 'text-[#c8c8da] hover:bg-white/[0.08]',
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#9898b4]">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {/* Hidden input for native form compatibility */}
      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  );
}
