// RevenueCat Webhook Event Types
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields

export interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

export interface RevenueCatEvent {
  aliases: string[];
  app_id: string;
  app_user_id: string;
  country_code: string;
  currency: string;
  entitlement_id: string | null;
  entitlement_ids: string[];
  environment: 'SANDBOX' | 'PRODUCTION';
  event_timestamp_ms: number;
  expiration_at_ms: number | null;
  id: string;
  is_family_share: boolean;
  offer_code: string | null;
  original_app_user_id: string;
  original_transaction_id: string;
  period_type: 'TRIAL' | 'INTRO' | 'NORMAL' | 'PROMOTIONAL';
  presented_offering_id: string | null;
  price: number;
  price_in_purchased_currency: number;
  product_id: string;
  purchased_at_ms: number;
  store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'AMAZON' | 'PROMOTIONAL';
  subscriber_attributes: Record<string, { value: string; updated_at_ms: number }>;
  takehome_percentage: number;
  tax_percentage: number;
  transaction_id: string;
  type: RevenueCatEventType;
}

export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'TRANSFER';

// Subscription status mapping
export const EVENT_TO_STATUS: Record<RevenueCatEventType, 'free' | 'pro' | 'lifetime' | null> = {
  INITIAL_PURCHASE: 'pro',
  RENEWAL: 'pro',
  CANCELLATION: null, // Keep current status, update expiration
  UNCANCELLATION: 'pro',
  NON_RENEWING_PURCHASE: 'lifetime', // One-time purchase
  SUBSCRIPTION_PAUSED: null, // Keep current status
  EXPIRATION: 'free',
  BILLING_ISSUE: null, // Keep current status
  PRODUCT_CHANGE: 'pro',
  TRANSFER: null, // Handle specially
};
