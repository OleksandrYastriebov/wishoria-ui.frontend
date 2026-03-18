import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageIcon, Loader2, Sparkles, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
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
  // Tracks the raw File object so it can be sent to the AI endpoint as Base64
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

  const handleFile = async (file: File) => {
    pendingFileRef.current = file;
    const result = await uploadMutation.mutateAsync(file);
    setValue('imageUrl', result.url);
    setPreviewUrl(result.url);
    setImageRemoved(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
  };

  useClipboardPaste((file) => void handleFile(file), isOpen);

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
    const payload = {
      title: data.title,
      url: data.url || undefined,
      price: data.price ? parseFloat(data.price) : undefined,
      description: data.description || undefined,
      imageUrl: data.imageUrl ? data.imageUrl : (imageRemoved ? '' : undefined),
    };

    if (isEdit && editItem) {
      updateMutation.mutate(
        { itemId: editItem.id, data: payload },
        { onSuccess: () => { onClose(); reset(); } }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { onClose(); reset(); },
      });
    }
  };

  const isGenerating = generateMutation.isPending;
  const isLoading = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;
  const canGenerateDescription = !!(titleValue?.trim()) || !!(previewUrl ?? imageUrlValue);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Item' : 'Add Item'} size="md">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="p-6 space-y-4">
        {/* Image upload */}
        <div>
          <label className="text-sm font-medium text-[#c8c8da] block mb-2">Image</label>
          {(previewUrl ?? imageUrlValue) ? (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/[0.08] mb-2">
              <img
                src={previewUrl ?? imageUrlValue}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setValue('imageUrl', '');
                  setImageRemoved(true);
                  pendingFileRef.current = null;
                }}
                className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors text-xs px-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 rounded-xl border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-1 text-[#55556e] hover:text-violet-400 hover:border-violet-500/40 transition-colors"
            >
              <ImageIcon size={18} />
              <span className="text-xs">Upload image</span>
              <span className="text-[11px] text-[#55556e]">or paste (Ctrl+V)</span>
            </button>
          )}
          {(previewUrl ?? imageUrlValue) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
            >
              <Upload size={12} />
              Replace
            </button>
          )}
          <p className="text-xs text-[#55556e] mt-1.5">Max file size: 5 MB</p>
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

        {/* Description with AI Generate button */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#c8c8da]">
              Description (optional)
            </label>
            {canGenerateDescription && (
              <button
                type="button"
                onClick={() => void handleGenerateDescription()}
                disabled={isGenerating || isLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#111118] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 active:from-violet-700 active:to-purple-700 shadow-sm"
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
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-white placeholder:text-white/25 transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent border-white/[0.08] bg-white/[0.05] hover:border-white/[0.14] disabled:opacity-40 disabled:cursor-not-allowed"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
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
  );
}
