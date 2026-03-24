'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Trash2, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments, useCreateComment, useDeleteComment } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { CommentSkeleton } from '../ui/SkeletonLoader';
import type { CommentDto } from '../../types';

interface CommentsSectionProps {
  wishlistId: string;
  itemId: string;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  isDeleting,
}: {
  comment: CommentDto;
  currentUserId: number | null;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const isOwn = currentUserId === comment.authorId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <Avatar
          src={comment.authorAvatarUrl}
          firstName={comment.authorFirstName}
          lastName={comment.authorLastName}
          size="xs"
        />
      )}

      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-stone-600 mb-0.5 px-1">
            {comment.authorFirstName} {comment.authorLastName}
          </span>
        )}
        <div className={`relative px-3 py-2 rounded-2xl text-sm break-words ${
          isOwn
            ? 'bg-amber-600 text-white rounded-br-sm'
            : 'bg-stone-100 text-stone-700 rounded-bl-sm'
        }`}>
          {comment.text}
        </div>
        <span className="text-[11px] text-stone-400 mt-0.5 px-1">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>

      {isOwn && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Delete comment"
        >
          <Trash2 size={12} />
        </button>
      )}
    </motion.div>
  );
}

export function CommentsSection({ wishlistId, itemId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { data, isLoading } = useComments(wishlistId, itemId);
  const createMutation = useCreateComment(wishlistId, itemId);
  const deleteMutation = useDeleteComment(wishlistId, itemId);
  const [text, setText] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { text: trimmed },
      {
        onSuccess: () => {
          setText('');
          textareaRef.current?.focus();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const comments = data?.comments ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
        <Lock size={13} className="text-amber-500" />
        <h4 className="text-sm font-semibold text-stone-700">Secret Discussion</h4>
        <span className="text-xs text-stone-400">(not visible to the owner)</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            No comments yet. Start the discussion!
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id ?? null}
                onDelete={handleDelete}
                isDeleting={deletingId === comment.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Avatar
            src={user.avatarUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size="xs"
          />
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (text.trim()) handleSubmit(e);
                }
              }}
              placeholder="Add to the secret discussion..."
              maxLength={1000}
              rows={1}
              className="w-full px-3 py-2 pr-10 text-sm rounded-xl border border-stone-200 bg-white/60 text-stone-900 placeholder:text-stone-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:border-stone-300 transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim() || createMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-600/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer"
              aria-label="Send comment"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-100">
          <Lock size={14} className="text-stone-400" />
          <p className="text-sm text-stone-500">
            <Link href="/sign-in" className="text-amber-700 hover:text-amber-600 hover:underline font-medium transition-colors">
              Log in
            </Link>{' '}
            to join the secret discussion
          </p>
        </div>
      )}
    </div>
  );
}
