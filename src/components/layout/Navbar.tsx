import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, List, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { UserSearchDropdown } from '../search/UserSearchDropdown';
import toast from 'react-hot-toast';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

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
      navigate('/');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pb-1.5">
        <div className="relative max-w-6xl mx-auto bg-[#13131f]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30 px-4 sm:px-5 flex items-center justify-between h-16 overflow-hidden">
          {/* Left glow — violet */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-violet-500/30 blur-2xl pointer-events-none z-0" />
          {/* Right glow — tiffany */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-[#0abfbc]/25 blur-2xl pointer-events-none z-0" />

          {/* Logo */}
          <Link
            to={user ? '/wishlists' : '/'}
            className="flex items-center gap-2.5 font-bold text-white hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg flex-shrink-0 z-10"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg tracking-tight">Wishoria</span>
          </Link>

          {/* Search — desktop only */}
          {user && (
            <div className="hidden sm:flex flex-1 justify-center px-8 max-w-sm mx-auto z-10">
              <UserSearchDropdown />
            </div>
          )}

          {/* Right side — desktop */}
          {user ? (
            <>
              {/* Desktop: avatar button */}
              <button
                ref={avatarBtnRef}
                onClick={() => menuOpen ? setMenuOpen(false) : openMenu()}
                className="hidden sm:flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer z-10"
                aria-label="Open user menu"
              >
                <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="md" className="ring-2 ring-violet-500/40 shadow-md shadow-violet-500/30" />
                <span className="text-sm font-medium text-[#c8c8da] max-w-[140px] truncate">
                  {user.firstName}
                </span>
              </button>

              {/* Mobile: hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#9898b4] hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/sign-in" className="px-3 py-1.5 text-sm font-medium text-[#9898b4] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg">
                Sign in
              </Link>
              <Link to="/sign-up" className="px-3.5 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080e]">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop user menu — portal to escape overflow:hidden */}
      {createPortal(
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
                className="w-52 bg-[#18181f] rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#9898b4] truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1.5">
                  <Link to="/wishlists" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#c8c8da] hover:bg-white/[0.05] hover:text-white transition-colors">
                    <List size={15} className="text-[#9898b4]" />
                    My Wishlists
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#c8c8da] hover:bg-white/[0.05] hover:text-white transition-colors">
                    <User size={15} className="text-[#9898b4]" />
                    Profile
                  </Link>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button onClick={() => { setMenuOpen(false); void handleLogout(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
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

      {/* Mobile menu modal */}
      <AnimatePresence>
        {mobileOpen && user && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed top-4 left-3 right-3 z-50 bg-[#18181f] rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="md" className="ring-2 ring-violet-500/40 shadow-md shadow-violet-500/30" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[#9898b4] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-[#9898b4] hover:text-white hover:bg-white/[0.06] transition-colors flex-shrink-0"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-[#55556e] mb-2 uppercase tracking-wide font-medium">
                  <Search size={11} />
                  Search people
                </div>
                <UserSearchDropdown />
              </div>

              {/* Nav links */}
              <div className="py-1.5">
                <Link
                  to="/wishlists"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#c8c8da] hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <List size={16} className="text-[#9898b4]" />
                  My Wishlists
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#c8c8da] hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <User size={16} className="text-[#9898b4]" />
                  Profile
                </Link>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  onClick={() => { setMobileOpen(false); void handleLogout(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
