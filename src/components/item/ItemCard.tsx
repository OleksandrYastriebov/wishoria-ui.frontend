import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ExternalLink, MessageCircle, Pencil, Trash2, CheckCircle2, Circle, DollarSign, Lock } from 'lucide-react';
import type { WishListItemDto } from '../../types';
import { ImageFallback } from '../ui/ImageFallback';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useDeleteItem, useToggleChecked } from '../../hooks/useWishlistItems';
import { useIsOverflowing } from '../../hooks/useIsOverflowing';
import type { AxiosError } from 'axios';

interface ItemCardProps {
  item: WishListItemDto;
  wishlistId: string;
  isOwner: boolean;
  currentUserId: number | null;
  onEdit: (item: WishListItemDto) => void;
  onOpenComments: (item: WishListItemDto) => void;
  onRequireAuth: () => void;
  wide?: boolean;
}

export function ItemCard({
  item,
  wishlistId,
  isOwner,
  currentUserId,
  onEdit,
  onOpenComments,
  onRequireAuth,
  wide = false,
}: ItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteItem(wishlistId);
  const toggleMutation = useToggleChecked(wishlistId);
  const { ref: titleRef, isOverflowing: titleOverflowing } = useIsOverflowing<HTMLDivElement>();

  const isReservedByOther =
    !isOwner &&
    item.isChecked &&
    item.checkedByUserId !== null &&
    item.checkedByUserId !== currentUserId;

  const handleToggle = () => {
    if (isReservedByOther) return;
    toggleMutation.mutate(
      { itemId: item.id, isChecked: !item.isChecked, currentUserId },
      {
        onError: (err) => {
          const axiosErr = err as AxiosError;
          if (axiosErr.response?.status === 403) {
            if (item.isChecked) {
              toast.error('This item is already reserved by someone else.');
            } else {
              onRequireAuth();
            }
          }
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(item.id, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`group rounded-2xl border transition-all duration-200 overflow-hidden bg-[#111118] border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/40 flex flex-col${
          item.isChecked ? ' opacity-60 saturate-0' : ''
        }`}
      >
        {/* Image — top, full width; wide cards use 16/9 */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: wide ? '16/9' : '4/3' }}>
          <ImageFallback
            src={item.imageUrl}
            alt={item.title}
            initials={item.title[0]?.toUpperCase()}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content below image */}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div ref={titleRef} className="relative min-w-0 overflow-hidden flex-1" title={titleOverflowing ? item.title : undefined}>
              <h3 className={`font-semibold text-sm whitespace-nowrap ${
                item.isChecked ? 'line-through text-white/30' : 'text-white'
              }`}>
                {item.title}
              </h3>
              {titleOverflowing && (
                <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#111118] to-transparent pointer-events-none" />
              )}
            </div>

            {isOwner && (
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg text-[#9898b4] hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-label="Edit item"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-[#9898b4] hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label="Delete item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {item.price !== null && (
            <div className="flex items-center gap-1 text-sm font-semibold text-violet-400">
              <DollarSign size={13} />
              {item.price.toFixed(2)}
            </div>
          )}

          {item.description && (
            <p className="text-xs text-[#9898b4] line-clamp-2">{item.description}</p>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleToggle}
              disabled={isReservedByOther || toggleMutation.isPending}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 rounded focus-visible:ring-violet-400 disabled:opacity-50 ${
                isReservedByOther
                  ? 'text-[#55556e] cursor-not-allowed'
                  : item.isChecked
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-[#9898b4] hover:text-emerald-400'
              }`}
            >
              {isReservedByOther ? (
                <Lock size={14} className="text-[#55556e]" />
              ) : item.isChecked ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : (
                <Circle size={14} />
              )}
              {item.isChecked ? 'Reserved' : 'Mark as reserved'}
            </button>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
              >
                <ExternalLink size={12} />
                View
              </a>
            )}

            {!isOwner && (
              <button
                onClick={() => onOpenComments(item)}
                className="flex items-center gap-1 text-xs text-[#55556e] hover:text-[#9898b4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded ml-auto"
              >
                <MessageCircle size={13} />
                Discuss
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete item"
        message={`Remove "${item.title}" from this wishlist?`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
