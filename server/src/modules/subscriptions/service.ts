import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../../lib/db.js';
import { userProfiles } from '../../db/schema/users.js';
import { subscriptionEvents } from '../../db/schema/subscriptions.js';
import { cacheDelete } from '../../lib/redis.js';
import { env } from '../../config/env.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../../middleware/error-handler.js';
import type { RevenueCatWebhookPayload, RevenueCatEvent, EVENT_TO_STATUS } from './types.js';
import type { SubscriptionStatusResponse } from '../../types/index.js';

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (profile.length === 0) {
    throw new NotFoundError('User profile not found');
  }

  const status = profile[0].subscriptionStatus as 'free' | 'pro' | 'lifetime';
  const isPro = status === 'pro' || status === 'lifetime';
  const trialEndsAt = profile[0].trialEndsAt;
  const isTrialActive = trialEndsAt !== null && trialEndsAt > new Date();

  return {
    status,
    expiresAt: profile[0].subscriptionExpiresAt?.toISOString() || null,
    trialEndsAt: trialEndsAt?.toISOString() || null,
    isTrialActive,
    features: {
      unlimitedAffirmations: isPro,
      premiumAffirmations: isPro,
      downloadBackgrounds: isPro,
    },
  };
}

export async function linkRevenueCatUser(userId: string, revenuecatUserId: string): Promise<void> {
  await db
    .update(userProfiles)
    .set({
      revenuecatUserId,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));
}

export async function processWebhook(
  payload: RevenueCatWebhookPayload,
  signature: string,
): Promise<void> {
  if (!env.REVENUECAT_WEBHOOK_SECRET) {
    throw new UnauthorizedError('Webhook secret not configured');
  }
  const isValid = verifySignature(payload, signature);
  if (!isValid) {
    throw new UnauthorizedError('Invalid webhook signature');
  }

  const event = payload.event;

  // Check for duplicate event (idempotency)
  const existing = await db
    .select({ id: subscriptionEvents.id })
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.eventId, event.id))
    .limit(1);

  if (existing.length > 0) {
    return; // Already processed
  }

  // Find user by RevenueCat user ID
  const user = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.revenuecatUserId, event.app_user_id))
    .limit(1);

  // Log the event
  await db.insert(subscriptionEvents).values({
    eventId: event.id,
    eventType: event.type,
    appUserId: event.app_user_id,
    userId: user.length > 0 ? user[0].userId : null,
    productId: event.product_id,
    transactionId: event.transaction_id,
    originalTransactionId: event.original_transaction_id,
    purchasedAt: event.purchased_at_ms ? new Date(event.purchased_at_ms) : null,
    expirationAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
    priceInUsd: event.price?.toString(),
    currency: event.currency,
    rawPayload: payload,
  });

  // Update user subscription if found
  if (user.length > 0) {
    await updateSubscriptionFromEvent(user[0].userId, event);
  }
}

async function updateSubscriptionFromEvent(userId: string, event: RevenueCatEvent): Promise<void> {
  const { type, product_id, expiration_at_ms } = event;

  let newStatus: 'free' | 'pro' | 'lifetime' | null = null;

  // Determine new status based on event type
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
      // Check if it's a lifetime purchase
      if (product_id?.toLowerCase().includes('lifetime')) {
        newStatus = 'lifetime';
      } else {
        newStatus = 'pro';
      }
      break;

    case 'NON_RENEWING_PURCHASE':
      // One-time purchase (lifetime)
      newStatus = 'lifetime';
      break;

    case 'EXPIRATION':
      newStatus = 'free';
      break;

    case 'CANCELLATION':
    case 'BILLING_ISSUE':
    case 'SUBSCRIPTION_PAUSED':
      // Keep current status, just update expiration
      break;

    default:
      return;
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    subscriptionProductId: product_id,
  };

  if (newStatus) {
    updateData.subscriptionStatus = newStatus;
  }

  if (expiration_at_ms) {
    updateData.subscriptionExpiresAt = new Date(expiration_at_ms);
  } else if (newStatus === 'lifetime') {
    updateData.subscriptionExpiresAt = null;
  }

  await db
    .update(userProfiles)
    .set(updateData)
    .where(eq(userProfiles.userId, userId));

  // Invalidate cache
  await cacheDelete(`user:${userId}:subscription`);
}

function verifySignature(payload: RevenueCatWebhookPayload, signature: string): boolean {
  if (!env.REVENUECAT_WEBHOOK_SECRET) {
    return true; // Skip verification if no secret configured
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.REVENUECAT_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export async function restorePurchases(userId: string): Promise<SubscriptionStatusResponse> {
  // In production, this would call RevenueCat API to get current subscriber info
  // For now, just return current status from database
  return getSubscriptionStatus(userId);
}
