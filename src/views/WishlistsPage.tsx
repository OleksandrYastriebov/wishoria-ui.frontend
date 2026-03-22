'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useWishlists } from '../hooks/useWishlists';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { WishlistModal } from '../components/wishlist/WishlistModal';
import { ShareModal } from '../components/wishlist/ShareModal';
import { AiGenerateModal } from '../components/wishlist/AiGenerateModal';
import { WishlistCardSkeleton } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import type { WishListDto } from '../types';

const MAX_WISHLISTS = 50;

function getBentoClass(index: number): string {
  return (index % 4 === 0 || index % 4 === 3)
    ? 'lg:col-span-2 sm:col-span-2'
    : 'col-span-1';
}

export default function WishlistsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useWishlists();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [editWishlist, setEditWishlist] = useState<WishListDto | null>(null);
  const [shareWishlist, setShareWishlist] = useState<WishListDto | null>(null);

  const wishlists = [...(data?.wishLists ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const atLimit = wishlists.length >= MAX_WISHLISTS;

  return (
    <Layout>
      <div className="flex items-start sm:items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {user?.firstName ? `${user.firstName}'s Wishlists` : 'My Wishlists'}
          </h1>
          {wishlists.length > 0 && (
            <p className="text-sm text-stone-500 mt-1">
              {wishlists.length} / {MAX_WISHLISTS} wishlists
            </p>
          )}
        </div>

        {!atLimit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fefdf8] shadow-lg shadow-amber-500/20 overflow-hidden cursor-pointer"
            >
              <motion.span
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%', skewX: '-15deg' }}
                animate={{ x: '200%', skewX: '-15deg' }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6, ease: 'easeInOut' }}
              />
              <Sparkles size={15} />
              Generate with AI
            </button>
            <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />}>
              New wishlist
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <WishlistCardSkeleton key={i} className={getBentoClass(i)} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-stone-500">Failed to load wishlists. Please refresh.</p>
        </div>
      ) : wishlists.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No wishlists yet"
          description="Create your first wishlist and start adding items you'd love to receive."
          action={
            <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={15} />}>
              Create wishlist
            </Button>
          }
        />
      ) : (
        <motion.div layout className={`grid grid-cols-1 sm:grid-cols-2 gap-4${wishlists.length > 3 ? ' lg:grid-cols-3' : ''}`}>
          <AnimatePresence>
            {wishlists.map((wl, index) => {
              const useBento = wishlists.length > 3;
              const wide = useBento && (index % 4 === 0 || index % 4 === 3);
              return (
                <div key={wl.id} className={useBento ? getBentoClass(index) : ''}>
                  <WishlistCard
                    wishlist={wl}
                    isOwner={wl.userId === user?.id}
                    onEdit={(w) => setEditWishlist(w)}
                    onShare={(w) => setShareWishlist(w)}
                    wide={wide}
                  />
                </div>
              );
            })}
          </AnimatePresence>
          {!atLimit && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-2xl border-2 border-dashed border-stone-300/60 hover:border-amber-400/60 hover:bg-amber-50/40 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-amber-600 min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <Plus size={28} strokeWidth={1.5} />
              <span className="text-sm font-medium">Add wishlist</span>
            </button>
          )}
        </motion.div>
      )}

      {atLimit && (
        <p className="text-sm text-amber-500 text-center mt-4">
          You&apos;ve reached the maximum of {MAX_WISHLISTS} wishlists.
        </p>
      )}

      <AiGenerateModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <WishlistModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <WishlistModal
        isOpen={!!editWishlist}
        onClose={() => setEditWishlist(null)}
        editWishlist={editWishlist}
      />
      {shareWishlist && (
        <ShareModal
          isOpen={!!shareWishlist}
          onClose={() => setShareWishlist(null)}
          wishlistId={shareWishlist.id}
          wishlistTitle={shareWishlist.title}
        />
      )}
    </Layout>
  );
}
