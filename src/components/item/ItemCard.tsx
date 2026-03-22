'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ExternalLink, MessageCircle, Pencil, Trash2, CheckCircle2, Circle, Lock } from 'lucide-react';
import type { WishListItemDto } from '../../types';
import { ImageFallback } from '../ui/ImageFallback';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useDeleteItem, useToggleChecked } from '../../hooks/useWishlistItems';
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
  const [tooltip, setTooltip] = useState<string | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteMutation = useDeleteItem(wishlistId);
  const toggleMutation = useToggleChecked(wishlistId);

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

  const startTooltip = (text: string) => {
    tooltipTimer.current = setTimeout(() => setTooltip(text), 1000);
  };

  const clearTooltip = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(null);
  };

  const fullText = [item.title, item.description].filter(Boolean).join('\n');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className={`group relative bg-white/75 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/90 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/15 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]${item.isChecked ? ' saturate-[0.35] opacity-70' : ''}`}
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: wide ? '16/9' : '4/3' }}
        >
          <ImageFallback
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* Reserved badge — top left */}
          {item.isChecked && (
            <div className="absolute top-3 left-3">
              {isReservedByOther ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-white/10 text-white/90 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_12px_rgba(0,0,0,0.25)]">
                  <Lock size={10} className="opacity-70" />
                  Reserved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-emerald-400/20 text-emerald-100 backdrop-blur-md border border-emerald-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_12px_rgba(0,0,0,0.25)]">
                  <CheckCircle2 size={10} className="opacity-80" />
                  Reserved
                </span>
              )}
            </div>
          )}

          {/* Text block — gradient lives here, covers only the text height */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-14 px-4 pb-4 pr-4"
            onMouseEnter={() => startTooltip(fullText)}
            onMouseLeave={clearTooltip}
          >
            {/* Tooltip popup */}
            {tooltip && (
              <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 z-20 bg-black/80 backdrop-blur-md text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/15 whitespace-pre-line pointer-events-none">
                {tooltip}
              </div>
            )}

            <h3
              className="font-bold text-white text-base sm:text-lg drop-shadow-sm whitespace-nowrap overflow-hidden"
              style={{ maskImage: 'linear-gradient(to right, black 70%, transparent 100%)' }}
            >
              {item.title}
            </h3>

            {item.price !== null && (
              <p className="text-white font-semibold text-sm mt-0.5 drop-shadow-sm">
                ${item.price.toFixed(2)}
              </p>
            )}

            {item.description && (
              <p
                className="text-white/65 text-xs mt-0.5 whitespace-nowrap overflow-hidden"
                style={{ maskImage: 'linear-gradient(to right, black 70%, transparent 100%)' }}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Floating glassmorphic control pill — hover on desktop, always visible on touch */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 bg-black/30 backdrop-blur-xl rounded-2xl px-2 py-2 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.3)] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          {isOwner ? (
            <>
              <button
                onClick={() => onEdit(item)}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 active:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                aria-label="Edit item"
              >
                <Pencil size={14} />
              </button>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="View item"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/25 active:bg-red-500/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 cursor-pointer"
                aria-label="Delete item"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleToggle}
                disabled={isReservedByOther || toggleMutation.isPending}
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isReservedByOther
                    ? 'text-white/40 cursor-not-allowed'
                    : item.isChecked
                    ? 'text-emerald-400 hover:bg-white/20 active:bg-white/10 cursor-pointer'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/10 cursor-pointer'
                }`}
                aria-label={item.isChecked ? 'Unreserve item' : 'Mark as reserved'}
              >
                {isReservedByOther ? (
                  <Lock size={14} />
                ) : item.isChecked ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </button>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="View item"
                >
                  <ExternalLink size={14} />
                </a>
              )}

              <button
                onClick={() => onOpenComments(item)}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/20 active:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                aria-label="Discuss item"
              >
                <MessageCircle size={14} />
              </button>
            </>
          )}
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
