'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, Lock, ArrowLeft, UserPlus, Package, LogIn, UserPlus as UserPlusIcon } from 'lucide-react';
import { useWishlistDetail } from '../hooks/useWishlistDetail';
import { useIsOverflowing } from '../hooks/useIsOverflowing';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { ItemCard } from '../components/item/ItemCard';
import { ItemModal } from '../components/item/ItemModal';
import { CommentsSection } from '../components/item/CommentsSection';
import { ShareModal } from '../components/wishlist/ShareModal';
import { WishlistModal } from '../components/wishlist/WishlistModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ImageFallback } from '../components/ui/ImageFallback';
import { ItemCardSkeleton } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { trackWishlistView } from '../lib/aep/events';
import type { WishListItemDto } from '../types';

const MAX_ITEMS = 50;

export default function WishlistDetailPage() {
  const params = useParams<{ wishlistId: string }>();
  const wishlistId = params?.wishlistId;
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromProfileIdStr = searchParams.get('fromProfileId');
  const fromProfileId = fromProfileIdStr ? parseInt(fromProfileIdStr, 10) : undefined;

  const { data: wishlist, isLoading: isWishlistLoading, isError } = useWishlistDetail(wishlistId ?? '', !isAuthLoading);
  const isLoading = isAuthLoading || isWishlistLoading;
  const { ref: titleRef, isOverflowing: titleOverflowing } = useIsOverflowing<HTMLDivElement>();
  const trackedWishlistId = useRef<string | null>(null);

  useEffect(() => {
    if (!wishlist || isAuthLoading) return;
    if (trackedWishlistId.current === wishlist.id) return;
    trackedWishlistId.current = wishlist.id;
    void trackWishlistView({
      wishlistId: wishlist.id,
      pageType: 'wishlist_detail',
      isPublic: wishlist.isPublic,
      hasImage: wishlist.imageUrl != null,
      ...(user && { userId: user.id, email: user.email }),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlist?.id, isAuthLoading]);

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<WishListItemDto | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditWishlistOpen, setIsEditWishlistOpen] = useState(false);
  const [commentsItem, setCommentsItem] = useState<WishListItemDto | null>(null);
  const [requireAuthOpen, setRequireAuthOpen] = useState(false);

  if (isError) {
    return (
      <Layout>
        <div className="text-center py-16 space-y-3">
          {!user ? (
            <>
              <p className="text-stone-500">Sign in to view this wishlist.</p>
              <Link href="/sign-in" className="inline-flex items-center gap-2 px-4 py-2 mt-1 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">Sign in</Link>
            </>
          ) : (
            <>
              <p className="text-stone-500">Wishlist not found or access denied.</p>
              <Link href="/wishlists" className="text-amber-700 hover:text-amber-600 hover:underline inline-block text-sm transition-colors">Back to wishlists</Link>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const isOwner = wishlist?.userId === user?.id;
  const items = (wishlist?.wishListItems ?? []).slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const atLimit = items.length >= MAX_ITEMS;

  return (
    <Layout>
      <button
        onClick={() => fromProfileId !== undefined ? router.push(`/profile/${fromProfileId}`) : router.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded cursor-pointer"
      >
        <ArrowLeft size={15} />
        {fromProfileId !== undefined ? 'Back to profile' : 'Back'}
      </button>

      {isLoading ? (
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="w-full h-48 bg-stone-200/60 animate-pulse" />
            <div className="p-5 space-y-2">
              <div className="h-6 w-1/3 bg-stone-200/60 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-stone-200/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (<ItemCardSkeleton key={i} />))}
          </div>
        </div>
      ) : wishlist ? (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="relative">
              <ImageFallback src={wishlist.imageUrl} alt={wishlist.title} className="w-full h-[390px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div ref={titleRef} className="relative min-w-0 overflow-hidden" title={titleOverflowing ? wishlist.title : undefined}>
                  <h1 className="text-xl font-bold text-stone-900 whitespace-nowrap">{wishlist.title}</h1>
                  {titleOverflowing && <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                  {items.filter((i) => i.isChecked).length > 0 && ` · ${items.filter((i) => i.isChecked).length} reserved`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${wishlist.isPublic ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>
                  {wishlist.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                  {wishlist.isPublic ? 'Public' : 'Private'}
                </span>
                <div className="flex items-center gap-2">
                  {isOwner && !wishlist.isPublic && <Button variant="secondary" size="sm" onClick={() => setIsShareOpen(true)} leftIcon={<UserPlus size={14} />}>Share</Button>}
                  {isOwner && <Button variant="secondary" size="sm" onClick={() => setIsEditWishlistOpen(true)}>Edit</Button>}
                  {isOwner && !atLimit && <Button size="sm" onClick={() => setIsAddItemOpen(true)} leftIcon={<Plus size={14} />}>Add item</Button>}
                </div>
              </div>
            </div>
          </motion.div>

          {items.length === 0 ? (
            <EmptyState icon={<Package size={26} />} title="No items yet"
              description={isOwner ? 'Add items to your wishlist so others know what to get you.' : 'This wishlist is empty.'}
              action={isOwner ? <Button onClick={() => setIsAddItemOpen(true)} leftIcon={<Plus size={15} />}>Add first item</Button> : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {items.map((item) => (
                    <div key={item.id} className="h-full">
                      <ItemCard item={item} wishlistId={wishlist.id} isOwner={isOwner} currentUserId={user?.id ?? null} currentUserEmail={user?.email} onEdit={(i) => setEditItem(i)} onOpenComments={(i) => setCommentsItem(i)} onRequireAuth={() => setRequireAuthOpen(true)} />
                    </div>
                  ))}
              </AnimatePresence>
              {isOwner && !atLimit && (
                <button onClick={() => setIsAddItemOpen(true)} className="rounded-2xl border-2 border-dashed border-stone-200 hover:border-amber-500/60 hover:bg-amber-600/5 transition-all duration-200 flex items-center justify-center gap-2 text-stone-400 hover:text-amber-700 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer">
                  <Plus size={20} strokeWidth={1.5} /><span className="text-sm font-medium">Add item</span>
                </button>
              )}
            </div>
          )}

          {atLimit && isOwner && <p className="text-sm text-amber-700 text-center">You&apos;ve reached the maximum of {MAX_ITEMS} items per wishlist.</p>}
        </div>
      ) : null}

      {wishlist && (
        <>
          <ItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} wishlistId={wishlist.id} />
          <ItemModal isOpen={!!editItem} onClose={() => setEditItem(null)} wishlistId={wishlist.id} editItem={editItem} />
          <WishlistModal isOpen={isEditWishlistOpen} onClose={() => setIsEditWishlistOpen(false)} editWishlist={wishlist} />
          {!wishlist.isPublic && isOwner && <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} wishlistId={wishlist.id} wishlistTitle={wishlist.title} />}
          <Modal isOpen={!!commentsItem} onClose={() => setCommentsItem(null)} title={commentsItem ? `Discuss: ${commentsItem.title}` : ''} size="md">
            {commentsItem && <div className="p-5"><CommentsSection wishlistId={wishlist.id} itemId={commentsItem.id} /></div>}
          </Modal>
        </>
      )}

      <Modal isOpen={requireAuthOpen} onClose={() => setRequireAuthOpen(false)} title="Sign in required" size="sm">
        <div className="px-6 py-5 text-center">
          <p className="text-sm text-stone-500 mb-5">You need to sign in or create an account to mark items as reserved.</p>
          <div className="flex gap-3">
            <Link href="/sign-in" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"><LogIn size={15} />Sign in</Link>
            <Link href="/sign-up" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"><UserPlusIcon size={15} />Sign up</Link>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
