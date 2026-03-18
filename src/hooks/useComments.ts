import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getComments, createComment, deleteComment } from '../api/endpoints';
import type { CreateCommentRequest } from '../types';

const commentsKey = (wishlistId: string, itemId: string) =>
  ['comments', wishlistId, itemId] as const;

export function useComments(wishlistId: string, itemId: string) {
  return useQuery({
    queryKey: commentsKey(wishlistId, itemId),
    queryFn: () => getComments(wishlistId, itemId),
    enabled: !!wishlistId && !!itemId,
  });
}

export function useCreateComment(wishlistId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(wishlistId, itemId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: commentsKey(wishlistId, itemId) });
    },
    onError: () => {
      toast.error('Failed to post comment.');
    },
  });
}

export function useDeleteComment(wishlistId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(wishlistId, itemId, commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: commentsKey(wishlistId, itemId) });
      toast.success('Comment deleted.');
    },
    onError: () => {
      toast.error('Failed to delete comment.');
    },
  });
}
