'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ImageCropModal } from '../ui/ImageCropModal';
import { useCreateWishlist, useUpdateWishlist } from '../../hooks/useWishlists';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useClipboardPaste } from '../../hooks/useClipboardPaste';
import { useAuth } from '../../hooks/useAuth';
import { trackWishlistCreated } from '../../lib/aep/events';
import type { WishListDto } from '../../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  isPublic: z.boolean(),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormData = z.infer<typeof schema>;

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWishlist?: WishListDto | null;
}

export function WishlistModal({ isOpen, onClose, editWishlist }: WishlistModalProps) {
  const isEdit = !!editWishlist;
  const { user } = useAuth();
  const createMutation = useCreateWishlist();
  const updateMutation = useUpdateWishlist();
  const uploadMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', isPublic: true, imageUrl: '' },
    mode: 'onChange',
  });

  const imageUrlValue = watch('imageUrl');
  const titleValue = watch('title');

  useEffect(() => {
    if (isOpen) {
      if (editWishlist) {
        reset({
          title: editWishlist.title,
          isPublic: editWishlist.isPublic,
          imageUrl: editWishlist.imageUrl ?? '',
        });
        setPreviewUrl(editWishlist.imageUrl);
      } else {
        reset({ title: '', isPublic: true, imageUrl: '' });
        setPreviewUrl(null);
      }
      setImageRemoved(false);
    }
  }, [isOpen, editWishlist, reset]);

  const openCrop = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    const croppedFile = new File([blob], 'cover.jpg', { type: blob.type });
    const result = await uploadMutation.mutateAsync(croppedFile);
    setValue('imageUrl', result.url);
    setPreviewUrl(result.url);
    setImageRemoved(false);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropExisting = async () => {
    const url = previewUrl ?? imageUrlValue;
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setCropSrc(objectUrl);
    } catch {
      toast.error('Could not load image for cropping.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    openCrop(file);
  };

  useClipboardPaste((file) => openCrop(file), isOpen);

  const onSubmit = async (data: FormData) => {
    const payload = {
      title: data.title,
      isPublic: data.isPublic,
      imageUrl: data.imageUrl ? data.imageUrl : (imageRemoved ? '' : undefined),
    };

    if (isEdit && editWishlist) {
      updateMutation.mutate(
        { id: editWishlist.id, data: payload },
        { onSuccess: () => { onClose(); reset(); } }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          void trackWishlistCreated({
            wishlistId: created.id,
            userId: user?.id,
            email: user?.email,
            isPublic: created.isPublic,
            hasImage: created.imageUrl != null,
          });
          onClose();
          reset();
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  return (
    <>
    <ImageCropModal
      imageSrc={cropSrc}
      onConfirm={(blob) => void handleCropConfirm(blob)}
      onCancel={handleCropCancel}
      previewType="wishlist"
      previewTitle={titleValue}
    />
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Wishlist' : 'New Wishlist'}>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-800 block mb-2">Cover Image</label>
          <div className="relative">
            {(previewUrl ?? imageUrlValue) ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-stone-200 mb-2 bg-stone-100">
                <img
                  src={previewUrl ?? imageUrlValue}
                  alt="Preview"
                  className="w-full max-h-64 object-contain"
                  onError={() => setPreviewUrl(null)}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleCropExisting()}
                    className="flex items-center gap-1 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors text-xs px-2 cursor-pointer"
                  >
                    <Crop size={11} />
                    Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValue('imageUrl', '');
                      setImageRemoved(true);
                    }}
                    className="p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors text-xs px-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-stone-700 hover:border-stone-400/60 transition-colors cursor-pointer"
              >
                <ImageIcon size={20} />
                <span className="text-xs">Upload cover image</span>
                <span className="text-[11px] text-stone-500">or paste (Ctrl+V)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
          </div>
          {(previewUrl ?? imageUrlValue) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg mt-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1"
            >
              <Upload size={12} />
              Replace image
            </button>
          )}
          <p className="text-xs text-stone-500 mt-1.5">Max file size: 5 MB</p>
        </div>

        <Input
          label="Title"
          placeholder="My birthday wishlist"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-300 hover:border-stone-400 transition-colors bg-white/60">
          <div>
            <p className="text-sm font-medium text-stone-900">Public wishlist</p>
            <p className="text-xs text-stone-500 mt-0.5">Anyone with the link can view it</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('isPublic')}
            />
            <div className="w-10 h-6 bg-stone-300 peer-focus:ring-2 peer-focus:ring-amber-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={() => { onClose(); reset(); }}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isLoading}
          >
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}
