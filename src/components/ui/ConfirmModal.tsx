'use client';

import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="px-6 py-5">
        <p className="text-sm text-stone-700 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white/60 backdrop-blur-sm border border-white/70 rounded-lg hover:bg-white/80 active:bg-white/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 cursor-pointer disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-600'
                : 'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 focus-visible:ring-amber-600'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
