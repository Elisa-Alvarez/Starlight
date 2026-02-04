import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

const getApiKeys = () => {
  const extra = Constants.expoConfig?.extra;
  return {
    apple: extra?.revenueCatApiKeyApple as string | undefined,
    google: extra?.revenueCatApiKeyGoogle as string | undefined,
  };
};

const API_KEYS = getApiKeys();

export const ENTITLEMENT_ID = 'Starlight Pro';

export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export async function initializeRevenueCat(): Promise<void> {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

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
    appUserID: null,
    useAmazon: false,
  });
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo;
}

export async function checkProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();

  if (offerings.current !== null) {
    return offerings.current;
  }

  return null;
}

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; isPro: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { customerInfo, isPro };
  } catch (error: any) {
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      throw { cancelled: true, message: 'Purchase cancelled' };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo;
  isPro: boolean;
}> {
  const customerInfo = await Purchases.restorePurchases();
  const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  return { customerInfo, isPro };
}

export async function identifyUser(userId: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

export async function logOutUser(): Promise<CustomerInfo> {
  const customerInfo = await Purchases.logOut();
  return customerInfo;
}

export async function getManagementURL(): Promise<string | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.managementURL;
  } catch {
    return null;
  }
}

export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {};
}

export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

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
