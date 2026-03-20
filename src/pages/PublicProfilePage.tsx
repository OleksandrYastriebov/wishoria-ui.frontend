import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Lock, Package, ChevronRight, Sparkles, Cake } from 'lucide-react';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/ui/Avatar';
import { ImageFallback } from '../components/ui/ImageFallback';
import { EmptyState } from '../components/ui/EmptyState';
import { SeoMeta } from '../components/ui/SeoMeta';
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
      className="group bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
    >
      <Link
        to={`/wishlists/${wishlist.id}`}
        state={{ fromProfileId: ownerUserId }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <ImageFallback
            src={wishlist.imageUrl}
            alt={wishlist.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/30 to-transparent" />

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
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Globe size={10} className="text-emerald-400" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Lock size={10} className="text-violet-400" />
                  Shared with you
                </span>
              )}
              <span className="text-xs text-white/40">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              {itemCount > 0 && (
                <span className="text-xs text-white/40">{checkedCount} reserved</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
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
          <p className="text-[#9898b4] text-sm">User not found or the profile is unavailable.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-violet-400 hover:text-violet-300 hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded transition-colors"
          >
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const seoTitle = profile
    ? `${profile.user.firstName} ${profile.user.lastName}'s wishlists`
    : undefined;
  const seoDescription = profile
    ? `${profile.publicWishlists.filter((w) => w.isPublic).length} public wishlists on Wishoria`
    : undefined;

  return (
    <Layout>
      <SeoMeta
        title={seoTitle}
        description={seoDescription}
        image={profile?.user.avatarUrl}
      />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#9898b4] hover:text-white transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
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
            className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6 flex items-center gap-5"
          >
            <Avatar
              src={profile.user.avatarUrl}
              firstName={profile.user.firstName}
              lastName={profile.user.lastName}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">
                {profile.user.firstName} {profile.user.lastName}
              </h1>
              {profile.user.profileDescription && (
                <p className="text-sm text-[#c8c8da] mt-1 line-clamp-2">
                  {profile.user.profileDescription}
                </p>
              )}
              {profile.user.dateOfBirth && (
                <p className="flex items-center gap-1.5 text-sm text-[#9898b4] mt-1">
                  <Cake size={13} className="text-violet-400 flex-shrink-0" />
                  {new Date(profile.user.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
              <p className="text-sm text-[#9898b4] mt-0.5">
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
              <button
                onClick={() => setIsGiftModalOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 flex-shrink-0 overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={15} className="relative z-10" />
                <span className="relative z-10">AI Gift Ideas</span>
              </button>
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
            <h2 className="text-base font-semibold text-[#c8c8da] mb-3">Wishlists</h2>

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
