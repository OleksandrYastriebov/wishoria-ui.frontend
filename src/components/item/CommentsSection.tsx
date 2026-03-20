import { useRef, useState } from 'react';
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
          <span className="text-xs font-semibold text-[#c8c8da] mb-0.5 px-1">
            {comment.authorFirstName} {comment.authorLastName}
          </span>
        )}
        <div className={`relative px-3 py-2 rounded-2xl text-sm break-words ${
          isOwn
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-white/[0.08] text-[#c8c8da] rounded-bl-sm'
        }`}>
          {comment.text}
        </div>
        <span className="text-[11px] text-[#55556e] mt-0.5 px-1">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>

      {isOwn && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-[#9898b4] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
      <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <Lock size={13} className="text-violet-400" />
        <h4 className="text-sm font-semibold text-[#c8c8da]">Secret Discussion</h4>
        <span className="text-xs text-[#55556e]">(not visible to the owner)</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[#55556e] text-center py-4">
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
              className="w-full px-3 py-2 pr-10 text-sm rounded-xl border border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/25 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent hover:border-white/[0.14] transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim() || createMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Send comment"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <Lock size={14} className="text-[#55556e]" />
          <p className="text-sm text-[#9898b4]">
            <a href="/sign-in" className="text-violet-400 hover:text-violet-300 hover:underline font-medium transition-colors">
              Log in
            </a>{' '}
            to join the secret discussion
          </p>
        </div>
      )}
    </div>
  );
}
