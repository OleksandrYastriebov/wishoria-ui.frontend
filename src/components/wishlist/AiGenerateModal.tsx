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
      <div className="relative overflow-hidden">
        <AnimatePresence>
          {generateMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#111118]/90 backdrop-blur-sm rounded-2xl"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-violet-500/30 border-t-violet-500 animate-spin" />
                <Sparkles size={16} className="absolute inset-0 m-auto text-violet-400" />
              </div>
              <p className="text-sm font-medium text-white">Generating your wishlist...</p>
              <p className="text-xs text-[#9898b4]">This may take a few seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Generate with AI</h2>
            <p className="text-xs text-violet-200 mt-0.5">
              Describe your wishlist and AI will create it for you
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#c8c8da]">
              Describe your wishlist
            </label>
            <textarea
              {...register('description')}
              rows={4}
              maxLength={500}
              placeholder="e.g. Birthday wishlist for a tech enthusiast who loves gaming and smart home devices, budget around $500..."
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition hover:border-white/[0.14]"
            />
            <div className="flex items-start justify-between gap-2">
              {errors.description ? (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs tabular-nums flex-shrink-0 ${isNearLimit ? 'text-red-400' : 'text-[#55556e]'}`}
              >
                {charsLeft} / 500
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#c8c8da]">Visibility</span>
            <div className="flex rounded-lg border border-white/[0.1] overflow-hidden">
              <button
                type="button"
                onClick={() => setValue('isPublic', false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  !isPublic
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#18181f] text-[#9898b4] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Lock size={12} />
                Private
              </button>
              <button
                type="button"
                onClick={() => setValue('isPublic', true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  isPublic
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#18181f] text-[#9898b4] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Globe size={12} />
                Public
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:from-violet-700 active:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080e] shadow-lg shadow-violet-500/20"
          >
            <Sparkles size={15} />
            Generate Wishlist
          </button>
        </form>
      </div>
    </Modal>
  );
}
