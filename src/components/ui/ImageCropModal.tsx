'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AnimatePresence, motion } from 'framer-motion';
import { Crop as CropIcon, Globe, X } from 'lucide-react';
import { Button } from './Button';

export type CropPreviewType = 'wishlist' | 'item';

const CARD_W = 357;
const CARD_H = 260;
const CARD_ASPECT_RATIO = CARD_W / CARD_H;

const PREVIEW_W = 220;
const PREVIEW_H = Math.round(PREVIEW_W / CARD_ASPECT_RATIO);

interface ImageCropModalProps {
  imageSrc: string | null;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  previewType?: CropPreviewType;
  previewTitle?: string;
}

function getInitialCrop(width: number, height: number): Crop {
  const heightNeededFor90w = (width * 0.9) / CARD_ASPECT_RATIO;
  const useWidthBased = heightNeededFor90w <= height * 0.92;

  return centerCrop(
    makeAspectCrop(
      useWidthBased ? { unit: '%', width: 90 } : { unit: '%', height: 90 },
      CARD_ASPECT_RATIO,
      width,
      height,
    ),
    width,
    height,
  );
}

async function cropToBlob(image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * 2;
  canvas.height = CARD_H * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Empty canvas')); return; }
        resolve(blob);
      },
      'image/jpeg',
      0.92,
    );
  });
}

interface TilePreviewProps {
  completedCrop: PixelCrop | undefined;
  imgRef: React.RefObject<HTMLImageElement | null>;
  previewType: CropPreviewType;
  previewTitle?: string;
}

function TilePreview({ completedCrop, imgRef, previewType, previewTitle }: TilePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imgRef.current;
    if (!canvas || !image || !completedCrop?.width || !completedCrop?.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    setHasDrawn(true);
  }, [completedCrop, imgRef]);

  const displayTitle = previewTitle?.trim() || (previewType === 'wishlist' ? 'Wishlist title' : 'Item title');

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] bg-stone-200 shrink-0"
      style={{ width: PREVIEW_W, height: PREVIEW_H }}
    >
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-amber-500 animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={PREVIEW_W}
        height={PREVIEW_H}
        className="w-full h-full"
        style={{ display: hasDrawn ? 'block' : 'none' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {previewType === 'wishlist' && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold bg-emerald-500/55 text-white backdrop-blur-md border border-emerald-300/60">
            <Globe size={8} />
            Public
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
        <p className="font-bold text-white text-sm truncate drop-shadow-sm">{displayTitle}</p>
        {previewType === 'wishlist' && (
          <p className="text-white/65 text-[11px] mt-0.5">3 items</p>
        )}
        {previewType === 'item' && (
          <p className="text-white font-semibold text-xs mt-0.5 drop-shadow-sm">$99.00</p>
        )}
      </div>
    </div>
  );
}

export function ImageCropModal({
  imageSrc,
  onConfirm,
  onCancel,
  previewType = 'item',
  previewTitle,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isApplying, setIsApplying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(getInitialCrop(width, height));
  }, []);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsApplying(true);
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop);
      onConfirm(blob);
    } finally {
      setIsApplying(false);
    }
  };

  const canApply = !!completedCrop?.width && !!completedCrop?.height && !isApplying;

  return (
    <AnimatePresence>
      {imageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white/60 backdrop-blur-2xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/50 z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <CropIcon size={16} className="text-stone-600" />
                <h2 className="text-lg font-semibold text-stone-900">Adjust image</h2>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-black/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6 overflow-y-auto max-h-[75vh]">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wide">Crop area</p>
                <div className="rounded-xl overflow-hidden bg-stone-900/10 flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={CARD_ASPECT_RATIO}
                    className="max-h-[340px]"
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop source"
                      className="max-h-[340px] w-full object-contain"
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
                <p className="text-[11px] text-stone-600 mt-2">
                  Drag to reposition · Proportions are fixed to match the card
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
                <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Card preview</p>
                <TilePreview
                  completedCrop={completedCrop}
                  imgRef={imgRef}
                  previewType={previewType}
                  previewTitle={previewTitle}
                />
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  How it will look in a tile
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                className="flex-1"
                disabled={!canApply}
                isLoading={isApplying}
              >
                Apply crop
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
