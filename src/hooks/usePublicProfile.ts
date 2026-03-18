import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/endpoints';

export function usePublicProfile(userId: number | undefined) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: userId !== undefined && !isNaN(userId),
    staleTime: 30_000,
    retry: 1,
  });
}
