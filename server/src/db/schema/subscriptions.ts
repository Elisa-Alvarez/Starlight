import { pgTable, text, timestamp, uuid, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { userProfiles } from './users.js';

export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: text('event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  appUserId: text('app_user_id').notNull(),
  userId: text('user_id').references(() => userProfiles.userId, { onDelete: 'set null' }),
  productId: text('product_id'),
  transactionId: text('transaction_id'),
  originalTransactionId: text('original_transaction_id'),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }),
  expirationAt: timestamp('expiration_at', { withTimezone: true }),
  cancelReason: text('cancel_reason'),
  isTrialConversion: boolean('is_trial_conversion'),
  priceInUsd: decimal('price_in_usd', { precision: 10, scale: 2 }),
  currency: text('currency'),
  rawPayload: jsonb('raw_payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type NewSubscriptionEvent = typeof subscriptionEvents.$inferInsert;
