import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Favorite, Category } from '../types';

interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;

  addFavorite: (affirmationId: string, text: string, category: Category) => void;
  removeFavorite: (affirmationId: string) => void;
  isFavorite: (affirmationId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,

      addFavorite: (affirmationId, text, category) => {
        const existing = get().favorites.find((f) => f.affirmationId === affirmationId);
        if (existing) return;

        const newFav: Favorite = {
          id: `fav_${Date.now()}`,
          affirmationId,
          text,
          category,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          favorites: [newFav, ...state.favorites],
        }));
      },

      removeFavorite: (affirmationId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.affirmationId !== affirmationId),
        }));
      },

      isFavorite: (affirmationId) => {
        return get().favorites.some((f) => f.affirmationId === affirmationId);
      },
    }),
    {
      name: 'starlight-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
