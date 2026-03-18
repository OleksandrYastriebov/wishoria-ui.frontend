import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserMinus, Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/SkeletonLoader';
import { isAxiosError } from 'axios';
import { useWishlistAccess, useGrantAccess, useRevokeAccess } from '../../hooks/useWishlistAccess';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  wishlistTitle: string;
}

export function ShareModal({ isOpen, onClose, wishlistId, wishlistTitle }: ShareModalProps) {
  const { data: accessData, isLoading } = useWishlistAccess(wishlistId);
  const grantMutation = useGrantAccess(wishlistId);
  const revokeMutation = useRevokeAccess(wishlistId);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    grantMutation.mutate(data.email, {
      onSuccess: () => reset(),
      onError: (err) => {
        const message = isAxiosError<{ errorMessage?: string }>(err)
          ? (err.response?.data?.errorMessage ?? 'Failed to grant access.')
          : 'Failed to grant access.';
        setError('email', { message });
      },
    });
  };

  const handleRevoke = (email: string) => {
    setRevokingEmail(email);
    revokeMutation.mutate(email, {
      onSettled: () => setRevokingEmail(null),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${wishlistTitle}"`}>
      <div className="p-6 space-y-5">
        {/* Add email form */}
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-3">
          <Input
            label="Invite by email"
            type="email"
            placeholder="friend@example.com"
            error={errors.email?.message}
            hint="An email notification will automatically be sent to the invited person."
            {...register('email')}
          />
          <Button
            type="submit"
            size="sm"
            isLoading={grantMutation.isPending}
            leftIcon={<Mail size={14} />}
          >
            Send invite
          </Button>
        </form>

        {/* People with access */}
        <div>
          <h4 className="text-sm font-medium text-[#c8c8da] mb-3">
            People with access
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !accessData || accessData.emails.length === 0 ? (
            <p className="text-sm text-[#55556e] py-4 text-center">
              No one has access yet. Invite someone above.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {accessData.emails.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Mail size={13} className="text-violet-400" />
                    </div>
                    <span className="text-sm text-[#c8c8da] truncate">{email}</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(email)}
                    disabled={revokingEmail === email}
                    className="p-1.5 rounded-lg text-[#9898b4] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label={`Remove ${email}`}
                  >
                    <UserMinus size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
