import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { generateGiftSuggestions } from '../api/endpoints';

interface ApiError {
  message?: string;
}

export function useGenerateGiftSuggestions() {
  return useMutation({
    mutationFn: (userId: number) => generateGiftSuggestions(userId),
    onError: (error: AxiosError<ApiError> | Error) => {
      const status = (error as AxiosError<ApiError>).response?.status;
      if (status === 429) {
        toast.error('Too many requests. Please try again later.');
        return;
      }
      const message =
        (error as AxiosError<ApiError>).response?.data?.message ??
        error.message ??
        'Failed to generate gift suggestions.';
      toast.error(message);
    },
  });
}
