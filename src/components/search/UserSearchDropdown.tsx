'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useUserSearch } from '../../hooks/useUserSearch';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function UserSearchDropdown() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(inputValue, 350);
  const { data: results = [], isFetching } = useUserSearch(debouncedQuery);

  const showDropdown = isOpen && debouncedQuery.trim().length >= 2;
  const showResults = showDropdown && results.length > 0;
  const showEmpty = showDropdown && !isFetching && results.length === 0;

  const updatePos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [showDropdown, updatePos]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSelectUser = useCallback(
    (userId: number) => {
      setIsOpen(false);
      setInputValue('');
      router.push(`/profile/${userId}`);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setInputValue('');
      }
    },
    []
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-xl border transition-all duration-200',
          'bg-white/70 backdrop-blur-sm border-stone-200/80',
          'focus-within:bg-white/90 focus-within:border-amber-400/70 focus-within:shadow-sm focus-within:shadow-amber-500/10'
        )}
      >
        <Search size={14} className="text-stone-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search people..."
          className="bg-transparent text-sm text-stone-900 placeholder:text-stone-400/60 outline-none flex-1 min-w-0"
          aria-label="Search users"
          aria-expanded={showDropdown}
          aria-controls="user-search-listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <AnimatePresence>
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.1 }}
              onClick={handleClear}
              className="text-stone-400 hover:text-stone-600 active:text-stone-900 transition-colors focus-visible:outline-none rounded ml-auto flex-shrink-0 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={13} />
            </motion.button>
          )}
        </AnimatePresence>
        {isFetching && debouncedQuery.trim().length >= 2 && (
          <Loader2 size={13} className="text-amber-500 animate-spin flex-shrink-0" />
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {showDropdown && dropdownPos && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                zIndex: 9999,
              }}
              className="bg-white/85 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/70 overflow-hidden"
              id="user-search-listbox"
              role="listbox"
              aria-label="Search results"
            >
              {showResults && (
                <ul className="py-1.5 max-h-64 overflow-y-auto">
                  {results.map((user, index) => (
                    <motion.li
                      key={user.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12, delay: index * 0.04 }}
                      role="option"
                    >
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.04] active:bg-black/[0.07] transition-colors text-left focus-visible:outline-none focus-visible:bg-black/[0.04] cursor-pointer"
                      >
                        <Avatar
                          src={user.avatarUrl}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}

              {showEmpty && (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-stone-400">No users found</p>
                </div>
              )}

              {isFetching && !showResults && (
                <div className="px-4 py-4 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="text-amber-500 animate-spin" />
                  <span className="text-sm text-stone-500">Searching...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
