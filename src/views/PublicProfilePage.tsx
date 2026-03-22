'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Lock, Package, ChevronRight, Sparkles, Cake } from 'lucide-react';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/ui/Avatar';
import { ImageFallback } from '../components/ui/ImageFallback';
import { EmptyState } from '../components/ui/EmptyState';
import {
  PublicProfileHeaderSkeleton,
  WishlistCardSkeleton,
} from '../components/ui/SkeletonLoader';
import { GiftSuggestionsModal } from '../components/wishlist/GiftSuggestionsModal';
import type { WishListDto } from '../types';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface ProfileWishlistCardProps {
  wishlist: WishListDto;
  ownerUserId: number;
  index: number;
}

function ProfileWishlistCard({ wishlist, ownerUserId, index }: ProfileWishlistCardProps) {
  const itemCount = wishlist.wishListItems.length;
  const checkedCount = wishlist.wishListItems.filter((i) => i.isChecked).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="group bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
    >
      <Link
        href={`/wishlists/${wishlist.id}?fromProfileId=${ownerUserId}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <ImageFallback
            src={wishlist.imageUrl}
            alt={wishlist.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-base truncate drop-shadow-sm flex items-center gap-1">
              {wishlist.title}
              <ChevronRight
                size={14}
                className="text-white/40 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </h3>
            <div className="flex items-center gap-3 mt-1">
              {wishlist.isPublic ? (
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Globe size={10} className="text-emerald-400" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Lock size={10} className="text-amber-400" />
                  Shared with you
                </span>
              )}
              <span className="text-xs text-white/50">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              {itemCount > 0 && (
                <span className="text-xs text-white/50">{checkedCount} reserved</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const parsedId = userId ? parseInt(userId, 10) : undefined;
  const validId = parsedId !== undefined && !isNaN(parsedId) ? parsedId : undefined;

  const { data: profile, isLoading, isError } = usePublicProfile(validId);

  useEffect(() => {
    if (isError) {
      toast.error('User not found.');
    }
  }, [isError]);

  if (isError) {
    return (
      <Layout>
        <div className="text-center py-16 space-y-3">
          <p className="text-stone-500 text-sm">User not found or the profile is unavailable.</p>
          <button
            onClick={() => router.back()}
            className="text-amber-600 hover:text-amber-500 hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded transition-colors cursor-pointer"
          >
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {isLoading ? (
        <div className="space-y-6">
          <PublicProfileHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <WishlistCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] p-6 flex items-center gap-5 relative"
          >
            <Avatar
              src={profile.user.avatarUrl}
              firstName={profile.user.firstName}
              lastName={profile.user.lastName}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-stone-900">
                {profile.user.firstName} {profile.user.lastName}
              </h1>
              {profile.user.profileDescription && (
                <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                  {profile.user.profileDescription}
                </p>
              )}
              {profile.user.dateOfBirth && (
                <p className="flex items-center gap-1.5 text-sm text-stone-500 mt-1">
                  <Cake size={13} className="text-amber-500 flex-shrink-0" />
                  {new Date(profile.user.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
              <p className="text-sm text-stone-500 mt-0.5">
                {profile.publicWishlists.filter((w) => w.isPublic).length}{' '}
                {profile.publicWishlists.filter((w) => w.isPublic).length === 1
                  ? 'public wishlist'
                  : 'public wishlists'}
                {profile.publicWishlists.some((w) => !w.isPublic) && (
                  <span>
                    {' '}·{' '}
                    {profile.publicWishlists.filter((w) => !w.isPublic).length} shared with you
                  </span>
                )}
              </p>
            </div>
            {(!profile.user.privateProfile || currentUser?.id === profile.user.id) && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setIsGiftModalOpen(true)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex-shrink-0 overflow-hidden group cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles size={15} className="relative z-10" />
                  <span className="relative z-10">AI Gift Ideas</span>
                </button>
              </div>
            )}
          </motion.div>

          {validId && (
            <GiftSuggestionsModal
              isOpen={isGiftModalOpen}
              onClose={() => setIsGiftModalOpen(false)}
              userId={validId}
              userName={profile.user.firstName}
            />
          )}

          <div>
            <h2 className="text-base font-semibold text-stone-600 mb-3">Wishlists</h2>

            {profile.publicWishlists.length === 0 ? (
              <EmptyState
                icon={<Package size={26} />}
                title="No wishlists available"
                description="This user hasn't shared any public wishlists yet."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {[...profile.publicWishlists]
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((wishlist, i) => (
                    <ProfileWishlistCard
                      key={wishlist.id}
                      wishlist={wishlist}
                      ownerUserId={profile.user.id}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
