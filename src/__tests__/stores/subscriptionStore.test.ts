jest.mock('../../services/revenuecat', () => ({
  initializeRevenueCat: jest.fn(),
  getCustomerInfo: jest.fn(),
  checkProEntitlement: jest.fn(),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  addCustomerInfoUpdateListener: jest.fn(),
  ENTITLEMENT_ID: 'Starlight Pro',
}));

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    setAuthToken: jest.fn(),
  },
}));

import { useSubscriptionStore } from '../../store/subscriptionStore';
import * as revenuecat from '../../services/revenuecat';
import { api } from '../../services/api';

const mockCustomerInfo = (isPro: boolean) => ({
  entitlements: {
    active: isPro ? { 'Starlight Pro': { isActive: true } } : {},
  },
});

beforeEach(() => {
  useSubscriptionStore.setState({
    isInitialized: false,
    isLoading: false,
    isPro: false,
    customerInfo: null,
    offerings: null,
    error: null,
    trialEndsAt: null,
    isTrialActive: false,
    hasAccess: false,
  });
  jest.clearAllMocks();
});

describe('subscriptionStore', () => {
  describe('initialize', () => {
    it('sets isPro when entitlement is active', async () => {
      (revenuecat.initializeRevenueCat as jest.Mock).mockResolvedValue(undefined);
      (revenuecat.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo(true));
      (revenuecat.addCustomerInfoUpdateListener as jest.Mock).mockImplementation(() => {});
      (revenuecat.getOfferings as jest.Mock).mockResolvedValue(null);

      await useSubscriptionStore.getState().initialize();

      const state = useSubscriptionStore.getState();
      expect(state.isPro).toBe(true);
      expect(state.hasAccess).toBe(true);
      expect(state.isInitialized).toBe(true);
    });

    it('fetches trial status when not pro', async () => {
      (revenuecat.initializeRevenueCat as jest.Mock).mockResolvedValue(undefined);
      (revenuecat.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo(false));
      (revenuecat.addCustomerInfoUpdateListener as jest.Mock).mockImplementation(() => {});
      (revenuecat.getOfferings as jest.Mock).mockResolvedValue(null);
      (api.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { trialEndsAt: '2025-01-10', isTrialActive: true },
      });

      await useSubscriptionStore.getState().initialize();

      const state = useSubscriptionStore.getState();
      expect(state.isPro).toBe(false);
      expect(state.isTrialActive).toBe(true);
      expect(state.hasAccess).toBe(true);
      expect(state.trialEndsAt).toBe('2025-01-10');
    });

    it('sets hasAccess false when RevenueCat fails', async () => {
      (revenuecat.initializeRevenueCat as jest.Mock).mockRejectedValue(new Error('RC init failed'));

      await useSubscriptionStore.getState().initialize();

      const state = useSubscriptionStore.getState();
      expect(state.hasAccess).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.error).toBe('RC init failed');
    });
  });

  describe('purchase', () => {
    it('returns true on success', async () => {
      (revenuecat.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo(true),
        isPro: true,
      });

      const result = await useSubscriptionStore.getState().purchase({} as any);

      expect(result).toBe(true);
      expect(useSubscriptionStore.getState().isPro).toBe(true);
    });

    it('handles cancellation without setting error', async () => {
      (revenuecat.purchasePackage as jest.Mock).mockRejectedValue({
        cancelled: true,
        message: 'Purchase cancelled',
      });

      const result = await useSubscriptionStore.getState().purchase({} as any);

      expect(result).toBe(false);
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });

  describe('restore', () => {
    it('sets error when no purchases found', async () => {
      (revenuecat.restorePurchases as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo(false),
        isPro: false,
      });

      const result = await useSubscriptionStore.getState().restore();

      expect(result).toBe(false);
      expect(useSubscriptionStore.getState().error).toBe('No previous purchases found');
    });
  });
});
