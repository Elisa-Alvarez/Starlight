export type Category =
  | 'anxiety'
  | 'winter'
  | 'energy'
  | 'self-care'
  | 'mindfulness'
  | 'sleep'
  | 'focus'
  | 'overthinking'
  | 'peace'
  | 'hard-days';

export interface Affirmation {
  id: string;
  text: string;
  category: Category;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  emoji: string;
}

export interface NotificationTime {
  id: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

export interface UserSettings {
  selectedCategories: Category[];
  notificationTimes: NotificationTime[];
  darkMode: boolean;
  onboardingCompleted: boolean;
}

export interface Favorite {
  id: string;
  affirmationId: string;
  text: string;
  category: Category;
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  viewDates: string[];
}

// Server API response types
export interface AffirmationResponse {
  id: string;
  text: string;
  category: Category;
  backgroundUrl: string | null;
  backgroundThumbnailUrl: string | null;
  backgroundColorPrimary: string | null;
  backgroundColorSecondary: string | null;
  displayColor: string | null;
  isPremium: boolean;
}

export interface CategoryInfoResponse {
  id: Category;
  name: string;
  description: string;
  emoji: string;
  affirmationCount: number;
}

export interface FavoriteResponse {
  id: string;
  affirmation: AffirmationResponse;
  widgetEnabled: boolean;
  widgetOrder: number | null;
  createdAt: string;
}

export interface DailyAffirmationsResponse {
  affirmations: AffirmationResponse[];
  remainingViews: number;
  requiresPremium: boolean;
}

export type MainTabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  Settings: undefined;
  Browse: undefined;
  CategoryView: { category: Category };
  Paywall: { dismissable?: boolean } | undefined;
  CustomerCenter: undefined;
  DailyAffirmation: { categories?: Category[] } | undefined;
  Customize: undefined;
  WidgetCustomization: undefined;
  CreateMix: undefined;
};
