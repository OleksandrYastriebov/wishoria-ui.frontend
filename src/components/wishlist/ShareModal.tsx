'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserMinus, Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/SkeletonLoader';
import { isAxiosError } from 'axios';
import Image from 'next/image';
import { useWishlistAccess, useGrantAccess, useRevokeAccess } from '../../hooks/useWishlistAccess';
import { useUserAutocomplete } from '../../hooks/useUserAutocomplete';
import type { UserAutocompleteDto } from '../../types';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailValue = watch('email', '');
  const { data: suggestions } = useUserAutocomplete(emailValue);

  const { ref: rhfRef, onChange: rhfOnChange, ...emailRegisterProps } = register('email');

  const handleSelectSuggestion = (user: UserAutocompleteDto) => {
    setValue('email', user.email, { shouldValidate: true });
    setShowDropdown(false);
  };

  const onSubmit = (data: FormData) => {
    grantMutation.mutate(data.email, {
      onSuccess: () => {
        reset();
        setShowDropdown(false);
      },
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

  const hasSuggestions = showDropdown && suggestions && suggestions.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${wishlistTitle}"`}>
      <div className="p-6 space-y-5">
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-3">
          <div className="relative">
            <Input
              {...emailRegisterProps}
              ref={(el) => {
                rhfRef(el);
                (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }}
              label="Invite by email"
              type="email"
              placeholder="friend@example.com"
              error={errors.email?.message}
              hint="An email notification will automatically be sent to the invited person."
              autoComplete="off"
              onChange={(e) => {
                void rhfOnChange(e);
                setShowDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onFocus={() => emailValue.trim().length >= 2 && setShowDropdown(true)}
            />
            {hasSuggestions && (
              <ul className="absolute z-50 left-0 right-0 mt-1 bg-white/90 backdrop-blur-xl border border-white/70 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden">
                {suggestions!.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(user)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 transition-colors text-left cursor-pointer"
                    >
                      {user.avatarUrl ? (
                        <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-amber-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-stone-900 font-medium truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-stone-400 truncate">{user.email}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            isLoading={grantMutation.isPending}
            leftIcon={<Mail size={14} />}
          >
            Send invite
          </Button>
        </form>

        <div>
          <h4 className="text-sm font-medium text-stone-600 mb-3">
            People with access
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !accessData || accessData.emails.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">
              No one has access yet. Invite someone above.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {accessData.emails.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Mail size={13} className="text-amber-500" />
                    </div>
                    <span className="text-sm text-stone-600 truncate">{email}</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(email)}
                    disabled={revokingEmail === email}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer disabled:cursor-not-allowed"
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
