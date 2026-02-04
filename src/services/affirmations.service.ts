import { api } from './api';
import type {
  AffirmationResponse,
  CategoryInfoResponse,
  DailyAffirmationsResponse,
} from '../types';

export async function fetchCategories(): Promise<CategoryInfoResponse[]> {
  const response = await api.get<CategoryInfoResponse[]>(
    '/api/affirmations/categories',
  );
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch categories');
  }
  return response.data;
}

export async function fetchCategoryAffirmations(
  categoryId: string,
  page = 1,
  limit = 50,
): Promise<{ affirmations: AffirmationResponse[]; total: number; hasMore: boolean }> {
  const response = await api.get<AffirmationResponse[]>(
    `/api/affirmations/categories/${encodeURIComponent(categoryId)}?page=${page}&limit=${limit}`,
  );
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch affirmations');
  }
  return {
    affirmations: response.data,
    total: response.meta?.total || response.data.length,
    hasMore: response.meta?.hasMore || false,
  };
}

export async function fetchDailyAffirmations(): Promise<DailyAffirmationsResponse> {
  const response = await api.get<DailyAffirmationsResponse>(
    '/api/affirmations/daily',
  );
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch daily affirmations');
  }
  return response.data;
}

export async function fetchRandomAffirmation(): Promise<AffirmationResponse> {
  const response = await api.get<AffirmationResponse>(
    '/api/affirmations/random',
  );
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch random affirmation');
  }
  return response.data;
}

export async function trackView(
  affirmationId: string,
  source: 'app' | 'widget' | 'notification' = 'app',
): Promise<void> {
  await api.post(`/api/affirmations/${encodeURIComponent(affirmationId)}/view`, { source });
}
