import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getWishlistAccess, grantAccess, revokeAccess } from '../api/endpoints';

const accessKey = (id: string) => ['wishlist-access', id] as const;

export function useWishlistAccess(wishlistId: string) {
  return useQuery({
    queryKey: accessKey(wishlistId),
    queryFn: () => getWishlistAccess(wishlistId),
    enabled: !!wishlistId,
  });
}

export function useGrantAccess(wishlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => grantAccess(wishlistId, { email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accessKey(wishlistId) });
      toast.success('Access granted. An email notification was sent.');
    },
  });
}

export function useRevokeAccess(wishlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => revokeAccess(wishlistId, email),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accessKey(wishlistId) });
      toast.success('Access revoked.');
    },
    onError: () => {
      toast.error('Failed to revoke access.');
    },
  });
}
