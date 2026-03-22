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
        <div className="relative px-6 py-5 border-b border-black/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
              <Gift size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Magic Gift Ideas</h2>
              <p className="text-xs text-stone-500 mt-0.5">AI-powered suggestions for {userName}</p>
            </div>
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
                  <div className="w-12 h-12 rounded-full border-[3px] border-amber-500/30 border-t-amber-500 animate-spin" />
                  <Sparkles size={16} className="absolute inset-0 m-auto text-amber-500" />
                </div>
                <p className="text-sm font-medium text-stone-900">Generating gift ideas...</p>
                <p className="text-xs text-stone-500">This may take a few seconds</p>
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
                <Gift size={28} className="text-stone-300" />
                <p className="text-sm font-medium text-stone-900">No suggestions available</p>
                <p className="text-xs text-stone-500">
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
                <p className="text-xs text-stone-500 mb-1">
                  Here are some ideas you might consider gifting:
                </p>
                {suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-600">
                      {i + 1}
                    </span>
                    <span className="text-sm text-stone-600">{suggestion}</span>
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
                <p className="text-sm font-medium text-stone-900">Could not generate suggestions</p>
                <p className="text-xs text-stone-500">Please try again later.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!mutation.isPending && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 border border-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
