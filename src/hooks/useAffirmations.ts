import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchCategoryAffirmations,
  fetchDailyAffirmations,
  fetchRandomAffirmation,
  trackView,
} from '../services/affirmations.service';
import type { AffirmationResponse, DailyAffirmationsResponse } from '../types';

export function useCategoryAffirmations(categoryId: string | undefined) {
  return useQuery<AffirmationResponse[]>({
    queryKey: ['affirmations', 'category', categoryId],
    queryFn: async () => {
      const result = await fetchCategoryAffirmations(categoryId!, 1, 50);
      return result.affirmations;
    },
    enabled: !!categoryId,
  });
}

export function useMultiCategoryAffirmations(categoryIds: string[] | undefined) {
  return useQuery<AffirmationResponse[]>({
    queryKey: ['affirmations', 'multi', categoryIds],
    queryFn: async () => {
      if (!categoryIds || categoryIds.length === 0) return [];
      const results = await Promise.all(
        categoryIds.map((id) => fetchCategoryAffirmations(id, 1, 50)),
      );
      return results.flatMap((r) => r.affirmations);
    },
    enabled: !!categoryIds && categoryIds.length > 0,
  });
}

export function useDailyAffirmations() {
  return useQuery<DailyAffirmationsResponse>({
    queryKey: ['affirmations', 'daily'],
    queryFn: fetchDailyAffirmations,
  });
}

export function useRandomAffirmation() {
  return useQuery<AffirmationResponse>({
    queryKey: ['affirmations', 'random'],
    queryFn: fetchRandomAffirmation,
    staleTime: 0, // Always fetch fresh
  });
}

export function useTrackView() {
  return useMutation({
    mutationFn: ({
      affirmationId,
      source = 'app',
    }: {
      affirmationId: string;
      source?: 'app' | 'widget' | 'notification';
    }) => trackView(affirmationId, source),
  });
}
