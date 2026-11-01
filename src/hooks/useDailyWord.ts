import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDailyWord, getNextDailyWord } from '../services/wordService';
import type { DailyWord } from '../types/word';

const dailyWordQueryKey = ['words', 'daily'] as const;

export default function useDailyWord() {
  const queryClient = useQueryClient();
  const dailyWordQuery = useQuery({
    queryKey: dailyWordQueryKey,
    queryFn: ({ signal }) => getDailyWord(signal),
    staleTime: Infinity,
    retry: 1,
  });
  const nextWordMutation = useMutation({
    mutationFn: () => getNextDailyWord(),
    onSuccess: (word) => {
      queryClient.setQueryData(dailyWordQueryKey, word);
    },
  });

  const reloadDailyWord = useCallback(async (): Promise<DailyWord> => {
    const result = await dailyWordQuery.refetch({ throwOnError: true });
    if (!result.data) {
      throw new Error('Não foi possível carregar uma palavra.');
    }

    return result.data;
  }, [dailyWordQuery.refetch]);
  const loadNextWord = useCallback(
    () => nextWordMutation.mutateAsync(),
    [nextWordMutation.mutateAsync],
  );

  return {
    dailyWord: dailyWordQuery.data ?? null,
    error: dailyWordQuery.error ?? null,
    isLoading: dailyWordQuery.isPending || nextWordMutation.isPending,
    loadNextWord,
    reloadDailyWord,
  };
}
