import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { uploadImage } from '../api/endpoints';

interface ApiError {
  message?: string;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        return Promise.reject(new Error('File is too large. Max size — 5MB'));
      }
      return uploadImage(file);
    },
    onError: (error: AxiosError<ApiError> | Error) => {
      const message =
        (error as AxiosError<ApiError>).response?.data?.message ??
        error.message ??
        'Failed to upload image.';
      toast.error(message);
    },
  });
}
