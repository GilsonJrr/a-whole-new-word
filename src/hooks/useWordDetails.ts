import { useQuery } from '@tanstack/react-query';
import { getWordByName } from '../services/api/wordsApi';

export default function useWordDetails(
  word: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ['words', 'details', word],
    queryFn: ({ signal }) => {
      if (!word) {
        throw new Error('Nenhuma palavra foi informada.');
      }

      return getWordByName(word, signal);
    },
    enabled: Boolean(word) && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}
