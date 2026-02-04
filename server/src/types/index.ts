// Category type - matches client
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

// All valid categories
export const CATEGORIES: Category[] = [
  'anxiety',
  'winter',
  'energy',
  'self-care',
  'mindfulness',
  'sleep',
  'focus',
  'overthinking',
  'peace',
  'hard-days',
];

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
}

// Affirmation response
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

// Category info response
export interface CategoryInfoResponse {
  id: Category;
  name: string;
  description: string;
  emoji: string;
  affirmationCount: number;
}

// User profile response
export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscriptionStatus: 'free' | 'pro' | 'lifetime';
  subscriptionExpiresAt: string | null;
  selectedCategories: Category[];
  dailyAffirmationCount: number;
  canViewMoreAffirmations: boolean;
  trialEndsAt: string | null;
  createdAt: string;
}

// Subscription status response
export interface SubscriptionStatusResponse {
  status: 'free' | 'pro' | 'lifetime';
  expiresAt: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  features: {
    unlimitedAffirmations: boolean;
    premiumAffirmations: boolean;
    downloadBackgrounds: boolean;
  };
}

// Favorite response
export interface FavoriteResponse {
  id: string;
  affirmation: AffirmationResponse;
  widgetEnabled: boolean;
  widgetOrder: number | null;
  createdAt: string;
}

// Widget affirmation (minimal payload)
export interface WidgetAffirmationResponse {
  id: string;
  text: string;
  category: Category;
  backgroundUrl: string | null;
  backgroundThumbnailUrl: string | null;
  backgroundColorPrimary: string | null;
  backgroundColorSecondary: string | null;
  displayColor: string | null;
}
