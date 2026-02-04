import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFavorites,
  addServerFavorite,
  removeServerFavorite,
} from '../services/favorites.service';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { FavoriteResponse, AffirmationResponse, Category } from '../types';

export function useFavorites() {
  const { isAuthenticated } = useAuthStore();
  const localFavorites = useFavoritesStore((s) => s.favorites);

  const serverQuery = useQuery<FavoriteResponse[]>({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
  });

  // For unauthenticated users, return local favorites mapped to the same shape
  if (!isAuthenticated) {
    const mapped: FavoriteResponse[] = localFavorites.map((f) => ({
      id: f.id,
      affirmation: {
        id: f.affirmationId,
        text: f.text,
        category: f.category,
        backgroundUrl: null,
        backgroundThumbnailUrl: null,
        backgroundColorPrimary: null,
        backgroundColorSecondary: null,
        displayColor: null,
        isPremium: false,
      },
      widgetEnabled: false,
      widgetOrder: null,
      createdAt: f.createdAt,
    }));
    return {
      data: mapped,
      isLoading: false,
      error: null,
    };
  }

  return serverQuery;
}

export function useIsFavorite(affirmationId: string): boolean {
  const { isAuthenticated } = useAuthStore();
  const localIsFavorite = useFavoritesStore((s) => s.isFavorite);
  const queryClient = useQueryClient();

  if (!isAuthenticated) {
    return localIsFavorite(affirmationId);
  }

  const favorites = queryClient.getQueryData<FavoriteResponse[]>(['favorites']);
  if (!favorites) return false;
  return favorites.some((f) => f.affirmation.id === affirmationId);
}

export function useToggleFavorite() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { addFavorite: localAdd, removeFavorite: localRemove, isFavorite: localIsFavorite } =
    useFavoritesStore();

  const addMutation = useMutation({
    mutationFn: addServerFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeServerFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggle = (affirmation: { id: string; text: string; category: Category }) => {
    if (!isAuthenticated) {
      // Use local store for unauthenticated users
      if (localIsFavorite(affirmation.id)) {
        localRemove(affirmation.id);
      } else {
        localAdd(affirmation.id, affirmation.text, affirmation.category);
      }
      return;
    }

    // Use server for authenticated users
    const favorites = queryClient.getQueryData<FavoriteResponse[]>(['favorites']);
    const existingFav = favorites?.find((f) => f.affirmation.id === affirmation.id);

    if (existingFav) {
      removeMutation.mutate(existingFav.id);
    } else {
      addMutation.mutate(affirmation.id);
    }
  };

  const isFavorite = (affirmationId: string): boolean => {
    if (!isAuthenticated) {
      return localIsFavorite(affirmationId);
    }
    const favorites = queryClient.getQueryData<FavoriteResponse[]>(['favorites']);
    if (!favorites) return false;
    return favorites.some((f) => f.affirmation.id === affirmationId);
  };

  return {
    toggle,
    isFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
