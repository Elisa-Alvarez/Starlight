import { api } from './api';
import type { FavoriteResponse } from '../types';

export async function fetchFavorites(): Promise<FavoriteResponse[]> {
  const response = await api.get<FavoriteResponse[]>('/api/favorites');
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch favorites');
  }
  return response.data;
}

export async function addServerFavorite(
  affirmationId: string,
): Promise<FavoriteResponse> {
  const response = await api.post<FavoriteResponse>('/api/favorites', {
    affirmationId,
  });
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to add favorite');
  }
  return response.data;
}

export async function removeServerFavorite(
  favoriteId: string,
): Promise<void> {
  const response = await api.delete(`/api/favorites/${encodeURIComponent(favoriteId)}`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to remove favorite');
  }
}
