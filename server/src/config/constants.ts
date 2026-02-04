export const APP_CONSTANTS = {
  // Trial
  TRIAL_DURATION_DAYS: 3,

  // Freemium limits
  FREE_DAILY_AFFIRMATION_LIMIT: 3,
  PRO_DAILY_AFFIRMATION_LIMIT: 50,

  // Subscription statuses
  SUBSCRIPTION_STATUS: {
    FREE: 'free',
    PRO: 'pro',
    LIFETIME: 'lifetime',
  } as const,

  // RevenueCat
  REVENUECAT: {
    ENTITLEMENT_ID: 'Starlight Pro',
    PRODUCT_IDS: {
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
      LIFETIME: 'lifetime',
    },
  } as const,

  // Cache TTLs (in seconds)
  CACHE_TTL: {
    CATEGORIES: 86400,       // 24 hours
    AFFIRMATIONS_LIST: 3600, // 1 hour
    AFFIRMATION_SINGLE: 86400, // 24 hours
    USER_DATA: 300,          // 5 minutes
    WIDGET: 300,             // 5 minutes
  } as const,

  // Rate limits
  RATE_LIMIT: {
    GLOBAL: { max: 100, timeWindow: '1 minute' },
    AUTH: { max: 10, timeWindow: '1 minute' },
    WEBHOOK: { max: 50, timeWindow: '1 minute' },
  } as const,

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 50,
  } as const,
} as const;

export type SubscriptionStatus = typeof APP_CONSTANTS.SUBSCRIPTION_STATUS[keyof typeof APP_CONSTANTS.SUBSCRIPTION_STATUS];
