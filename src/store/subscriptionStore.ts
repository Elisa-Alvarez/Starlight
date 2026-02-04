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
import { api } from '../services/api';

interface SubscriptionState {
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  error: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  hasAccess: boolean;
  initialize: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  isPro: false,
  customerInfo: null,
  offerings: null,
  error: null,
  trialEndsAt: null,
  isTrialActive: false,
  hasAccess: false,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      await initializeRevenueCat();

      const customerInfo = await getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      addCustomerInfoUpdateListener((info) => {
        const isPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
        set({ customerInfo: info, isPro, hasAccess: isPro || get().isTrialActive });
      });

      if (isPro) {
        set({
          isInitialized: true,
          customerInfo,
          isPro,
          hasAccess: true,
          isLoading: false,
        });
      } else {
        let trialEndsAt: string | null = null;
        let isTrialActive = false;

        try {
          const response = await api.get<{ data: { trialEndsAt: string | null; isTrialActive: boolean } }>('/api/subscriptions/status');
          if (response.success && response.data) {
            trialEndsAt = response.data.trialEndsAt;
            isTrialActive = response.data.isTrialActive;
          }
        } catch {
        }

        set({
          isInitialized: true,
          customerInfo,
          isPro,
          trialEndsAt,
          isTrialActive,
          hasAccess: isTrialActive,
          isLoading: false,
        });
      }

      get().fetchOfferings();
    } catch (error: any) {
      set({
        isInitialized: true,
        isLoading: false,
        hasAccess: false,
        error: error.message || 'Failed to initialize',
      });
    }
  },

  refreshCustomerInfo: async () => {
    try {
      const customerInfo = await getCustomerInfo();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      set({ customerInfo, isPro, hasAccess: isPro || get().isTrialActive });
    } catch {
    }
  },

  fetchOfferings: async () => {
    try {
      const offerings = await getOfferings();
      set({ offerings });
    } catch {
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    set({ isLoading: true, error: null });

    try {
      const { customerInfo, isPro } = await purchasePackage(pkg);
      set({ customerInfo, isPro, hasAccess: isPro || get().isTrialActive, isLoading: false });
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

  restore: async () => {
    set({ isLoading: true, error: null });

    try {
      const { customerInfo, isPro } = await restorePurchases();
      set({ customerInfo, isPro, hasAccess: isPro || get().isTrialActive, isLoading: false });

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

  clearError: () => set({ error: null }),
}));
