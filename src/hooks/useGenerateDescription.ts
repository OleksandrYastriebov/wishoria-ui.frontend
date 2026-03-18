import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { generateItemDescription } from '../api/endpoints';
import type { GenerateDescriptionRequest } from '../types';

interface ApiError {
  message?: string;
}

export function useGenerateDescription(wishlistId: string) {
  return useMutation({
    mutationFn: (data: GenerateDescriptionRequest) =>
      generateItemDescription(wishlistId, data),
    onSuccess: () => {
      toast.success('Description generated!');
    },
    onError: (error: AxiosError<ApiError> | Error) => {
      const message =
        (error as AxiosError<ApiError>).response?.data?.message ??
        error.message ??
        'Failed to generate description.';
      toast.error(message);
    },
  });
}
