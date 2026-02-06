import { create } from 'zustand';
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  initializeRevenueCat,
  getCustomerInfo,
  checkProEntitlement,
  getOfferings,
  purchasePackage,
  restorePurchases,
  addCustomerInfoUpdateListener,
  ENTITLEMENT_ID,
} from '../services/revenuecat';

interface SubscriptionState {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  isPro: false,
  customerInfo: null,
  offerings: null,
  error: null,

  // Initialize RevenueCat
  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      await initializeRevenueCat();

      // Get initial customer info
      const customerInfo = await getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      // Listen for updates
      addCustomerInfoUpdateListener((info) => {
        const isPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
        set({ customerInfo: info, isPro });
      });

      set({
        isInitialized: true,
        customerInfo,
        isPro,
        isLoading: false,
      });

      // Fetch offerings in background
      get().fetchOfferings();
    } catch (error: any) {
      console.error('Failed to initialize subscriptions:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to initialize',
      });
    }
  },

  // Refresh customer info
  refreshCustomerInfo: async () => {
    try {
      const customerInfo = await getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      set({ customerInfo, isPro });
    } catch (error: any) {
      console.error('Failed to refresh customer info:', error);
    }
  },

  // Fetch available offerings
  fetchOfferings: async () => {
    try {
      const offerings = await getOfferings();
      set({ offerings });
    } catch (error: any) {
      console.error('Failed to fetch offerings:', error);
    }
  },

  // Purchase a package
  purchase: async (pkg: PurchasesPackage) => {
    set({ isLoading: true, error: null });

    try {
      const { customerInfo, isPro } = await purchasePackage(pkg);
      set({ customerInfo, isPro, isLoading: false });
      return isPro;
    } catch (error: any) {
      if (error.cancelled) {
        set({ isLoading: false });
        return false;
      }

      set({
        isLoading: false,
        error: error.message || 'Purchase failed',
      });
      return false;
    }
  },

  // Restore purchases
  restore: async () => {
    set({ isLoading: true, error: null });

    try {
      const { customerInfo, isPro } = await restorePurchases();
      set({ customerInfo, isPro, isLoading: false });

      if (!isPro) {
        set({ error: 'No previous purchases found' });
      }

      return isPro;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to restore purchases',
      });
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
