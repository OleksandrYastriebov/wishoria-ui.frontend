import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/endpoints';

export function usePublicProfile(userId: number | undefined, page = 0, size = 6) {
  return useQuery({
    queryKey: ['public-profile', userId, page, size],
    queryFn: () => getUserProfile(userId!, page, size),
    enabled: userId !== undefined && !isNaN(userId),
    staleTime: 30_000,
    retry: 1,
  });
}
