import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/endpoints';

const MIN_QUERY_LENGTH = 2;

export function useUserSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ['user-search', trimmed],
    queryFn: () => searchUsers(trimmed),
    enabled,
    staleTime: 15_000,
    placeholderData: [],
  });
}
