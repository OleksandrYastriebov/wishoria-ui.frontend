'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Lock, Pencil, Trash2, UserPlus } from 'lucide-react';
import type { WishListDto } from '../../types';
import { ImageFallback } from '../ui/ImageFallback';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useDeleteWishlist } from '../../hooks/useWishlists';
interface WishlistCardProps {
  wishlist: WishListDto;
  isOwner: boolean;
  onEdit: (wishlist: WishListDto) => void;
  onShare: (wishlist: WishListDto) => void;
}

export function WishlistCard({ wishlist, isOwner, onEdit, onShare }: WishlistCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteWishlist();

  const handleDelete = () => {
    deleteMutation.mutate(wishlist.id, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  const itemCount = wishlist.wishListItems.length;
  const checkedCount = wishlist.wishListItems.filter((i) => i.isChecked).length;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="group relative bg-white/75 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/90 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/15 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] min-h-[390px] h-full"
      >
        <Link
          href={`/wishlists/${wishlist.id}`}
          className="absolute inset-0 overflow-hidden block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ImageFallback
            src={wishlist.imageUrl}
            alt={wishlist.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3">
            {wishlist.isPublic ? (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/55 text-white backdrop-blur-md border border-emerald-300/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(0,0,0,0.45)]">
                <Globe size={10} />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-black/40 text-white backdrop-blur-md border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(0,0,0,0.45)]">
                <Lock size={10} />
                Private
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pr-3">
            <h3 className="font-bold text-white text-base sm:text-lg truncate drop-shadow-sm">{wishlist.title}</h3>
            <p className="text-white/70 text-xs mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
              {checkedCount > 0 && ` · ${checkedCount} reserved`}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 bg-black/30 backdrop-blur-xl rounded-2xl px-2 py-2 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.3)]">
            {!wishlist.isPublic && (
              <button
                onClick={() => onShare(wishlist)}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 active:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                aria-label="Share wishlist"
              >
                <UserPlus size={14} />
              </button>
            )}
            <button
              onClick={() => onEdit(wishlist)}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 active:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
              aria-label="Edit wishlist"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/25 active:bg-red-500/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 cursor-pointer"
              aria-label="Delete wishlist"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete wishlist"
        message={`Are you sure you want to delete "${wishlist.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
