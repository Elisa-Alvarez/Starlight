import { pgTable, text, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User profile table (app-specific data; auth is handled by Supabase)
export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id').primaryKey(), // Supabase Auth user ID
  revenuecatUserId: text('revenuecat_user_id').unique(),
  subscriptionStatus: text('subscription_status').notNull().default('free'),
  subscriptionProductId: text('subscription_product_id'),
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
  dailyAffirmationCount: integer('daily_affirmation_count').notNull().default(0),
  lastDailyReset: date('last_daily_reset').notNull().default(sql`CURRENT_DATE`),
  selectedCategories: text('selected_categories').array().notNull().default(sql`ARRAY['anxiety','winter','energy','self-care','mindfulness','sleep','focus','overthinking','peace','hard-days']::text[]`),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  timezone: text('timezone').default('UTC'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
