'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGenerateWishlist } from '../../hooks/useWishlists';

const schema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiGenerateModal({ isOpen, onClose }: AiGenerateModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', isPublic: false },
  });

  const description = watch('description');
  const isPublic = watch('isPublic');
  const charsLeft = description.length;
  const isNearLimit = charsLeft > 450;

  const generateMutation = useGenerateWishlist(() => {
    reset();
    onClose();
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      generateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = (values: FormValues) => {
    generateMutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={generateMutation.isPending ? () => {} : onClose} size="md">
      <div className="relative">
        <AnimatePresence>
          {generateMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-amber-500/30 border-t-amber-500 animate-spin" />
                <Sparkles size={16} className="absolute inset-0 m-auto text-amber-500" />
              </div>
              <p className="text-sm font-medium text-stone-900">Generating your wishlist...</p>
              <p className="text-xs text-stone-500">This may take a few seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative px-6 py-5 border-b border-black/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Generate with AI</h2>
              <p className="text-xs text-stone-500 mt-0.5">Describe your wishlist and AI will create it for you</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-800 block mb-2">
              Describe your wishlist
            </label>
            <textarea
              {...register('description')}
              rows={4}
              maxLength={500}
              placeholder="e.g. Birthday wishlist for a tech enthusiast who loves gaming and smart home devices, budget around $500..."
              className="w-full resize-none rounded-xl border border-stone-300 bg-white/60 px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition hover:border-stone-400"
            />
            <div className="flex items-start justify-between gap-2 mt-1">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs tabular-nums flex-shrink-0 ${isNearLimit ? 'text-red-500' : 'text-stone-400'}`}>
                {charsLeft} / 500
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-300 hover:border-stone-400 transition-colors bg-white/60">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe size={15} className="text-stone-500" /> : <Lock size={15} className="text-stone-500" />}
              <div>
                <p className="text-sm font-medium text-stone-900">Public wishlist</p>
                <p className="text-xs text-stone-500 mt-0.5">Anyone with the link can view it</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('isPublic', !isPublic)}
              className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isPublic ? 'bg-amber-500' : 'bg-stone-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${isPublic ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={generateMutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-700 bg-white/60 hover:bg-white/80 hover:border-stone-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-500 hover:bg-amber-400 active:bg-amber-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 shadow-sm"
            >
              <Sparkles size={14} />
              Generate Wishlist
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
