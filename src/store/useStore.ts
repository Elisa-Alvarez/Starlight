import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, NotificationTime, Affirmation } from '../types';
import { AFFIRMATIONS, getRandomAffirmation } from '../data/affirmations';
import { DEFAULT_NOTIFICATION_TIMES, ALL_CATEGORIES } from '../constants/theme';

interface AppState {
  // Settings
  selectedCategories: Category[];
  notificationTimes: NotificationTime[];
  darkMode: boolean;
  onboardingCompleted: boolean;

  // Current affirmation
  currentAffirmation: Affirmation | null;

  // Actions
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setNotificationTimes: (times: NotificationTime[]) => void;
  toggleNotificationTime: (id: string) => void;
  setDarkMode: (enabled: boolean) => void;
  completeOnboarding: () => void;
  getNewAffirmation: () => void;
  initializeAffirmation: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedCategories: [...ALL_CATEGORIES] as Category[],
      notificationTimes: DEFAULT_NOTIFICATION_TIMES,
      darkMode: false,
      onboardingCompleted: false,
      currentAffirmation: null,

      // Actions
      setSelectedCategories: (categories) => {
        set({ selectedCategories: categories });
      },

      toggleCategory: (category) => {
        set((state) => {
          const isSelected = state.selectedCategories.includes(category);
          if (isSelected && state.selectedCategories.length === 1) {
            // Don't allow deselecting all categories
            return state;
          }
          return {
            selectedCategories: isSelected
              ? state.selectedCategories.filter((c) => c !== category)
              : [...state.selectedCategories, category],
          };
        });
      },

      setNotificationTimes: (times) => {
        set({ notificationTimes: times });
      },

      toggleNotificationTime: (id) => {
        set((state) => ({
          notificationTimes: state.notificationTimes.map((time) =>
            time.id === id ? { ...time, enabled: !time.enabled } : time
          ),
        }));
      },

      setDarkMode: (enabled) => {
        set({ darkMode: enabled });
      },

      completeOnboarding: () => {
        set({ onboardingCompleted: true });
      },

      getNewAffirmation: () => {
        const { selectedCategories } = get();
        const newAffirmation = getRandomAffirmation(selectedCategories);
        set({ currentAffirmation: newAffirmation });
      },

      initializeAffirmation: () => {
        const { currentAffirmation, selectedCategories } = get();
        if (!currentAffirmation) {
          const newAffirmation = getRandomAffirmation(selectedCategories);
          set({ currentAffirmation: newAffirmation });
        }
      },
    }),
    {
      name: 'starlight-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedCategories: state.selectedCategories,
        notificationTimes: state.notificationTimes,
        darkMode: state.darkMode,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
