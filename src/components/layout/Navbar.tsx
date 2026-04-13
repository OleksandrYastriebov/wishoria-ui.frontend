'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, User, List, Menu, X, Search, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { UserSearchDropdown } from '../search/UserSearchDropdown';
import toast from 'react-hot-toast';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const openMenu = useCallback(() => {
    if (!avatarBtnRef.current) return;
    const rect = avatarBtnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setMenuOpen(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onResize() {
      if (!avatarBtnRef.current) return;
      const rect = avatarBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      router.push('/');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pb-1.5">
        <div className="relative max-w-6xl mx-auto bg-white/90 backdrop-blur-2xl border border-stone-200/80 rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.12),0_12px_40px_rgba(0,0,0,0.08)] px-4 sm:px-5 flex items-center justify-between h-16 overflow-hidden">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-amber-200/30 blur-2xl pointer-events-none z-0" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-yellow-100/40 blur-2xl pointer-events-none z-0" />

          <Link
            href={user ? '/wishlists' : '/'}
            className="flex items-center gap-2.5 font-bold text-stone-900 hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg flex-shrink-0 z-10"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/40">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg tracking-tight">Wishoria</span>
          </Link>

          {user && (
            <div className="hidden sm:flex flex-1 justify-center px-8 max-w-sm mx-auto z-10">
              <UserSearchDropdown />
            </div>
          )}

          {user && (
            <a
              href="/aep-quiz/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-black/[0.04] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex-shrink-0 z-10"
            >
              <BookOpen size={15} />
              Practice Test
            </a>
          )}

          {user ? (
            <>
              <button
                ref={avatarBtnRef}
                onClick={() => menuOpen ? setMenuOpen(false) : openMenu()}
                className="hidden sm:flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-black/[0.04] active:bg-black/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer z-10"
                aria-label="Open user menu"
              >
                <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="md" className="ring-2 ring-amber-400/50 shadow-md shadow-amber-400/20" />
                <span className="text-sm font-medium text-stone-600 max-w-[140px] truncate">
                  {user.firstName}
                </span>
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-black/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in" className="px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg">
                Sign in
              </Link>
              <Link href="/sign-up" className="px-3.5 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fefdf8]">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {mounted && createPortal(
        <AnimatePresence>
          {menuOpen && menuPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
                className="w-52 bg-white/65 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/70 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-black/[0.06]">
                  <p className="text-sm font-semibold text-stone-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-stone-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1.5">
                  <Link href="/wishlists" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors">
                    <List size={15} className="text-stone-400" />
                    My Wishlists
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors">
                    <User size={15} className="text-stone-400" />
                    Profile
                  </Link>
                  <a href="/aep-quiz/index.html" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors">
                    <BookOpen size={15} className="text-stone-400" />
                    AJO Practice Test
                  </a>
                  <div className="my-1 border-t border-black/[0.06]" />
                  <button onClick={() => { setMenuOpen(false); void handleLogout(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 transition-colors">
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {mobileOpen && user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed top-4 left-3 right-3 z-50 bg-white/65 backdrop-blur-2xl rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="md" className="ring-2 ring-amber-400/50 shadow-md shadow-amber-400/20" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-black/[0.06] transition-colors flex-shrink-0"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-2 uppercase tracking-wide font-medium">
                  <Search size={11} />
                  Search people
                </div>
                <UserSearchDropdown />
              </div>

              <div className="py-1.5">
                <Link
                  href="/wishlists"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors"
                >
                  <List size={16} className="text-stone-400" />
                  My Wishlists
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors"
                >
                  <User size={16} className="text-stone-400" />
                  Profile
                </Link>
                <a
                  href="/aep-quiz/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-black/[0.04] hover:text-stone-900 transition-colors"
                >
                  <BookOpen size={16} className="text-stone-400" />
                  AJO Practice Test
                </a>
                <div className="my-1 border-t border-black/[0.06]" />
                <button
                  onClick={() => { setMobileOpen(false); void handleLogout(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
