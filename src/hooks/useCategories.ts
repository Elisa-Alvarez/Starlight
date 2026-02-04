import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../services/affirmations.service';
import { CATEGORIES } from '../data/affirmations';
import type { CategoryInfoResponse } from '../types';

export function useCategories() {
  return useQuery<CategoryInfoResponse[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: CATEGORIES.map((c) => ({
      ...c,
      affirmationCount: 0,
    })),
  });
}
