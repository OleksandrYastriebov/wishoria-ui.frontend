import { useQuery } from '@tanstack/react-query';
import { getWishlist } from '../api/endpoints';

export function useWishlistDetail(wishlistId: string, authReady = true) {
  return useQuery({
    queryKey: ['wishlist', wishlistId],
    queryFn: () => getWishlist(wishlistId),
    enabled: !!wishlistId && authReady,
  });
}
