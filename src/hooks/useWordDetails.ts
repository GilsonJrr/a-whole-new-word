import { useQuery } from '@tanstack/react-query';
import { getWordByName } from '../services/api/wordsApi';

export default function useWordDetails(word: string | undefined) {
  return useQuery({
    queryKey: ['words', 'details', word],
    queryFn: ({ signal }) => {
      if (!word) {
        throw new Error('Nenhuma palavra foi informada.');
      }

      return getWordByName(word, signal);
    },
    enabled: Boolean(word),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
