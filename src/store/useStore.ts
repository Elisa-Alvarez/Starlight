import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, NotificationTime, Affirmation } from '../types';
import { DEFAULT_NOTIFICATION_TIMES, ALL_CATEGORIES } from '../constants/theme';

interface AppState {
  // Settings
  selectedCategories: Category[];
  notificationTimes: NotificationTime[];
  darkMode: boolean;
  onboardingCompleted: boolean;
  selectedTheme: string;

  // Current affirmation (last viewed)
  currentAffirmation: Affirmation | null;

  // Actions
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setNotificationTimes: (times: NotificationTime[]) => void;
  toggleNotificationTime: (id: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setSelectedTheme: (themeId: string) => void;
  completeOnboarding: () => void;
  setCurrentAffirmation: (affirmation: Affirmation) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedCategories: [...ALL_CATEGORIES] as Category[],
      notificationTimes: DEFAULT_NOTIFICATION_TIMES,
      darkMode: false,
      onboardingCompleted: false,
      selectedTheme: 'default',
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

      setSelectedTheme: (themeId) => {
        set({ selectedTheme: themeId });
      },

      completeOnboarding: () => {
        set({ onboardingCompleted: true });
      },

      setCurrentAffirmation: (affirmation) => {
        set({ currentAffirmation: affirmation });
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
        selectedTheme: state.selectedTheme,
      }),
    }
  )
);
