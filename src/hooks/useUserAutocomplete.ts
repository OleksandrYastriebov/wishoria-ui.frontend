import { useQuery } from '@tanstack/react-query';
import { autocompleteUsers } from '../api/endpoints';

const MIN_QUERY_LENGTH = 2;

export function useUserAutocomplete(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ['user-autocomplete', trimmed],
    queryFn: () => autocompleteUsers(trimmed),
    enabled,
    staleTime: 10_000,
    placeholderData: [],
  });
}
