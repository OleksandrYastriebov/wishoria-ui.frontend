import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  generateWishlist,
} from '../api/endpoints';
import type { CreateWishlistRequest, GenerateWishlistRequest, UpdateWishlistRequest, WishListDto } from '../types';

export const WISHLISTS_KEY = ['wishlists'] as const;

export function useWishlists() {
  return useQuery({
    queryKey: WISHLISTS_KEY,
    queryFn: getWishlists,
  });
}

export function useCreateWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWishlistRequest) => createWishlist(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: WISHLISTS_KEY });
      toast.success('Wishlist created!');
    },
    onError: () => {
      toast.error('Failed to create wishlist.');
    },
  });
}

export function useUpdateWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWishlistRequest }) =>
      updateWishlist(id, data),
    onSuccess: (_res, { id }) => {
      void qc.invalidateQueries({ queryKey: WISHLISTS_KEY });
      void qc.invalidateQueries({ queryKey: ['wishlist', id] });
      toast.success('Wishlist updated!');
    },
    onError: () => {
      toast.error('Failed to update wishlist.');
    },
  });
}

export function useDeleteWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWishlist(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: WISHLISTS_KEY });
      toast.success('Wishlist deleted.');
    },
    onError: () => {
      toast.error('Failed to delete wishlist.');
    },
  });
}

export function useGenerateWishlist(onSuccess?: (wishlist: WishListDto) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateWishlistRequest) => generateWishlist(data),
    onSuccess: (wishlist) => {
      void qc.invalidateQueries({ queryKey: WISHLISTS_KEY });
      toast.success('Wishlist generated!');
      onSuccess?.(wishlist);
    },
    onError: () => {
      toast.error('Failed to generate wishlist. Please try again.');
    },
  });
}
