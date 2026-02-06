import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

// API Keys - Get from Expo config
const getApiKeys = () => {
  const extra = Constants.expoConfig?.extra;
  return {
    apple: extra?.revenueCatApiKeyApple as string | undefined,
    google: extra?.revenueCatApiKeyGoogle as string | undefined,
  };
};

const API_KEYS = getApiKeys();

// Entitlement identifier - must match your RevenueCat dashboard
export const ENTITLEMENT_ID = 'Starlight Pro';

// Product identifiers - must match your RevenueCat dashboard
export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with the appropriate API key for the platform
    const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;

    if (!apiKey) {
      const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
      const envVarName = Platform.OS === 'ios' ? 'REVENUECAT_API_KEY_APPLE' : 'REVENUECAT_API_KEY_GOOGLE';
      throw new Error(
        `RevenueCat API key is missing for ${platform}. ` +
        `Please set ${envVarName} in your .env file ` +
        `and ensure it's included in app.config.js extra config.`
      );
    }

    await Purchases.configure({
      apiKey,
      appUserID: null, // Let RevenueCat generate anonymous ID
      useAmazon: false,
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

/**
 * Get customer info including entitlements
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has active Starlight Pro entitlement
 */
export async function checkProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    return false;
  }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      return offerings.current;
    }

    console.warn('No current offering found');
    return null;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; isPro: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return { customerInfo, isPro };
  } catch (error: any) {
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      // User cancelled - not an error
      console.log('Purchase cancelled by user');
      throw { cancelled: true, message: 'Purchase cancelled' };
    }

    console.error('Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo;
  isPro: boolean;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return { customerInfo, isPro };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Identify user (for syncing across devices)
 * Call this when user logs in
 */
export async function identifyUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Failed to identify user:', error);
    throw error;
  }
}

/**
 * Log out user (reset to anonymous)
 * Call this when user logs out
 */
export async function logOutUser(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error('Failed to log out user:', error);
    throw error;
  }
}

/**
 * Get subscription management URL (for managing subscriptions)
 */
export async function getManagementURL(): Promise<string | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.managementURL;
  } catch (error) {
    console.error('Failed to get management URL:', error);
    return null;
  }
}

/**
 * Listen for customer info updates
 * Returns an unsubscribe function
 */
export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  // RevenueCat SDK handles listener cleanup internally
  return () => {};
}

/**
 * Format price for display
 */
export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get subscription period text
 */
export function getSubscriptionPeriod(pkg: PurchasesPackage): string {
  const identifier = pkg.identifier.toLowerCase();

  if (identifier.includes('lifetime')) {
    return 'Lifetime';
  }
  if (identifier.includes('yearly') || identifier.includes('annual')) {
    return 'per year';
  }
  if (identifier.includes('monthly')) {
    return 'per month';
  }

  // Fallback to package type
  switch (pkg.packageType) {
    case 'LIFETIME':
      return 'Lifetime';
    case 'ANNUAL':
      return 'per year';
    case 'MONTHLY':
      return 'per month';
    case 'WEEKLY':
      return 'per week';
    default:
      return '';
  }
}

/**
 * Calculate savings for yearly vs monthly
 */
export function calculateYearlySavings(
  monthlyPkg: PurchasesPackage | undefined,
  yearlyPkg: PurchasesPackage | undefined
): number | null {
  if (!monthlyPkg || !yearlyPkg) return null;

  const monthlyPrice = monthlyPkg.product.price;
  const yearlyPrice = yearlyPkg.product.price;
  const yearlyFromMonthly = monthlyPrice * 12;

  if (yearlyFromMonthly <= 0) return null;

  const savings = ((yearlyFromMonthly - yearlyPrice) / yearlyFromMonthly) * 100;
  return Math.round(savings);
}
