'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, ImageIcon, Loader2, Sparkles, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ImageCropModal } from '../ui/ImageCropModal';
import { useCreateItem, useUpdateItem } from '../../hooks/useWishlistItems';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useClipboardPaste } from '../../hooks/useClipboardPaste';
import { useGenerateDescription } from '../../hooks/useGenerateDescription';
import { fileToBase64DataUri } from '../../utils/imageUpload';
import type { WishListItemDto } from '../../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  url: z.union([z.literal(''), z.string().url('Must be a valid URL').max(2048, 'Max 2048 characters')]).optional(),
  price: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), { message: 'Must be a number' })
    .refine((v) => !v || parseFloat(v) >= 0, { message: 'Price must be positive' })
    .refine((v) => {
      if (!v) return true;
      const parts = v.split('.');
      const intPart = parts[0].replace('-', '');
      const fracPart = parts[1] ?? '';
      return intPart.length <= 8 && fracPart.length <= 2;
    }, { message: 'Price format is invalid (e.g. 12345678.99)' }),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
});

type FormData = z.infer<typeof schema>;

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  editItem?: WishListItemDto | null;
}

export function ItemModal({ isOpen, onClose, wishlistId, editItem }: ItemModalProps) {
  const isEdit = !!editItem;
  const createMutation = useCreateItem(wishlistId);
  const updateMutation = useUpdateItem(wishlistId);
  const uploadMutation = useUploadImage();
  const generateMutation = useGenerateDescription(wishlistId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const pendingFileRef = useRef<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', url: '', price: '', description: '', imageUrl: '' },
    mode: 'onChange',
  });

  const imageUrlValue = watch('imageUrl');
  const titleValue = watch('title');

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        reset({
          title: editItem.title,
          url: editItem.url ?? '',
          price: editItem.price?.toString() ?? '',
          description: editItem.description ?? '',
          imageUrl: editItem.imageUrl ?? '',
        });
        setPreviewUrl(editItem.imageUrl);
      } else {
        reset({ title: '', url: '', price: '', description: '', imageUrl: '' });
        setPreviewUrl(null);
      }
      setImageRemoved(false);
      pendingFileRef.current = null;
    }
  }, [isOpen, editItem, reset]);

  const openCrop = (file: File) => {
    pendingFileRef.current = file;
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    const croppedFile = new File([blob], pendingFileRef.current?.name ?? 'image.jpg', { type: blob.type });
    pendingFileRef.current = croppedFile;
    const result = await uploadMutation.mutateAsync(croppedFile);
    setValue('imageUrl', result.url);
    setPreviewUrl(result.url);
    setImageRemoved(false);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    pendingFileRef.current = null;
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

  const handleGenerateDescription = async () => {
    const title = titleValue?.trim();
    const hasImage = !!(pendingFileRef.current ?? previewUrl ?? imageUrlValue);
    if (!title && !hasImage) {
      toast.error('Please enter a title first.');
      return;
    }

    let base64Image: string | undefined;
    let mimeType: string | undefined;

    if (pendingFileRef.current) {
      const file = pendingFileRef.current;
      base64Image = await fileToBase64DataUri(file);
      mimeType = file.type;
    }

    const result = await generateMutation.mutateAsync({
      title,
      base64Image: base64Image ?? '',
      mimeType: mimeType,
    });

    setValue('description', result.description, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    const clearing = (val: string | undefined) =>
      isEdit ? (val || '') : (val || undefined);

    const parsedPrice = data.price ? parseFloat(data.price) : undefined;

    if (isEdit && editItem) {
      updateMutation.mutate(
        {
          itemId: editItem.id,
          data: {
            title: data.title,
            url: clearing(data.url),
            price: parsedPrice ?? null,
            description: clearing(data.description),
            imageUrl: data.imageUrl ? data.imageUrl : (imageRemoved ? '' : undefined),
          },
        },
        { onSuccess: () => { onClose(); reset(); } }
      );
    } else {
      createMutation.mutate(
        {
          title: data.title,
          url: data.url || undefined,
          price: parsedPrice,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
        },
        { onSuccess: () => { onClose(); reset(); } }
      );
    }
  };

  const isGenerating = generateMutation.isPending;
  const isLoading = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;
  const canGenerateDescription = !!(titleValue?.trim()) || !!(previewUrl ?? imageUrlValue);

  return (
    <>
    <ImageCropModal
      imageSrc={cropSrc}
      onConfirm={(blob) => void handleCropConfirm(blob)}
      onCancel={handleCropCancel}
      previewType="item"
      previewTitle={titleValue}
    />
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Item' : 'Add Item'} size="md">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-2">Image</label>
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
                    pendingFileRef.current = null;
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
              className="w-full h-20 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-stone-700 hover:border-stone-400 transition-colors cursor-pointer"
            >
              <ImageIcon size={18} />
              <span className="text-xs">Upload image</span>
              <span className="text-[11px] text-stone-500">or paste (Ctrl+V)</span>
            </button>
          )}
          {(previewUrl ?? imageUrlValue) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg mt-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1"
            >
              <Upload size={12} />
              Replace
            </button>
          )}
          <p className="text-xs text-stone-500 mt-1.5">Max file size: 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
        </div>

        <Input
          label="Title"
          placeholder="AirPods Pro"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            placeholder="99.99"
            error={errors.price?.message}
            {...register('price')}
          />
          <Input
            label="Link (optional)"
            type="url"
            placeholder="https://..."
            error={errors.url?.message}
            {...register('url')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700">
              Description (optional)
            </label>
            {canGenerateDescription && (
              <button
                type="button"
                onClick={() => void handleGenerateDescription()}
                disabled={isGenerating || isLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 active:from-amber-700 active:to-orange-700 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    AI Generate
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            placeholder="Any color, just not white"
            rows={2}
            disabled={isGenerating}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent border-stone-200 bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={() => { onClose(); reset(); }}
            className="flex-1"
            disabled={isLoading || isGenerating}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading} disabled={isGenerating}>
            {isEdit ? 'Save' : 'Add item'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}
