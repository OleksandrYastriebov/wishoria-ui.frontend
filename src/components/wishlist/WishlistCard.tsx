import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  wide?: boolean;
}

export function WishlistCard({ wishlist, isOwner, onEdit, onShare, wide = false }: WishlistCardProps) {
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
        className="group relative bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
      >
        {/* Cover image — full bleed hero */}
        <Link
          to={`/wishlists/${wishlist.id}`}
          className="block relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          style={{ aspectRatio: wide ? '16/9' : '4/3' }}
        >
          <ImageFallback
            src={wishlist.imageUrl}
            alt={wishlist.title}
            initials={wishlist.title.slice(0, 2).toUpperCase()}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/30 to-transparent" />

          {/* Visibility badge (top-right) */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm ${
              wishlist.isPublic
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}>
              {wishlist.isPublic ? <Globe size={10} /> : <Lock size={10} />}
              {wishlist.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {/* Title overlay (bottom of image) */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-base sm:text-lg truncate drop-shadow-sm">{wishlist.title}</h3>
            <p className="text-white/50 text-xs mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
              {checkedCount > 0 && ` · ${checkedCount} reserved`}
            </p>
          </div>
        </Link>

        {/* Action bar (owner only) */}
        {isOwner && (
          <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-white/[0.05] opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
            {!wishlist.isPublic && (
              <button
                onClick={() => onShare(wishlist)}
                className="p-1.5 rounded-lg text-[#9898b4] hover:text-violet-400 hover:bg-violet-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Share wishlist"
              >
                <UserPlus size={14} />
              </button>
            )}
            <button
              onClick={() => onEdit(wishlist)}
              className="p-1.5 rounded-lg text-[#9898b4] hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Edit wishlist"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-[#9898b4] hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
