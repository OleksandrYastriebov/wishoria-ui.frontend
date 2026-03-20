'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGenerateGiftSuggestions } from '../../hooks/useGiftSuggestions';

interface GiftSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export function GiftSuggestionsModal({ isOpen, onClose, userId, userName }: GiftSuggestionsModalProps) {
  const mutation = useGenerateGiftSuggestions();

  useEffect(() => {
    if (isOpen) {
      mutation.mutate(userId);
    } else {
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const suggestions = mutation.data?.suggestions ?? [];

  return (
    <Modal isOpen={isOpen} onClose={mutation.isPending ? () => {} : onClose} size="md">
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Gift size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Magic Gift Ideas</h2>
            <p className="text-xs text-violet-200 mt-0.5">
              AI-powered suggestions for {userName}
            </p>
          </div>
        </div>

        <div className="p-6 min-h-[200px]">
          <AnimatePresence mode="wait">
            {mutation.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-8"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-[3px] border-violet-500/30 border-t-violet-500 animate-spin" />
                  <Sparkles size={16} className="absolute inset-0 m-auto text-violet-400" />
                </div>
                <p className="text-sm font-medium text-white">Generating gift ideas...</p>
                <p className="text-xs text-[#9898b4]">This may take a few seconds</p>
              </motion.div>
            )}

            {mutation.isSuccess && suggestions.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-8 text-center"
              >
                <Gift size={28} className="text-[#55556e]" />
                <p className="text-sm font-medium text-white">No suggestions available</p>
                <p className="text-xs text-[#9898b4]">
                  Encourage {userName} to fill out their profile for better results.
                </p>
              </motion.div>
            )}

            {mutation.isSuccess && suggestions.length > 0 && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                <p className="text-xs text-[#9898b4] mb-1">
                  Here are some ideas you might consider gifting:
                </p>
                {suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[#c8c8da]">{suggestion}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {mutation.isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-8 text-center"
              >
                <p className="text-sm font-medium text-white">Could not generate suggestions</p>
                <p className="text-xs text-[#9898b4]">Please try again later.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!mutation.isPending && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-[#9898b4] bg-white/[0.05] hover:bg-white/[0.08] hover:text-white border border-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
