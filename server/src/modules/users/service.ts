import { eq, sql } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { userProfiles } from '../../db/schema/users.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { NotFoundError } from '../../middleware/error-handler.js';
import type { Category } from '../../types/index.js';

export async function getUserProfile(userId: string) {
  let profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  // Auto-create profile if it doesn't exist
  if (profile.length === 0) {
    await db.insert(userProfiles).values({ userId }).onConflictDoNothing();
    profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
  }

  if (profile.length === 0) {
    throw new NotFoundError('User profile not found');
  }

  const p = profile[0];

  // Check if daily reset is needed
  const today = new Date().toISOString().split('T')[0];
  if (p.lastDailyReset !== today) {
    await db
      .update(userProfiles)
      .set({
        dailyAffirmationCount: 0,
        lastDailyReset: sql`CURRENT_DATE`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    p.dailyAffirmationCount = 0;
  }

  const isPro = p.subscriptionStatus === 'pro' || p.subscriptionStatus === 'lifetime';
  const limit = isPro ? APP_CONSTANTS.PRO_DAILY_AFFIRMATION_LIMIT : APP_CONSTANTS.FREE_DAILY_AFFIRMATION_LIMIT;

  return {
    userId: p.userId,
    subscriptionStatus: p.subscriptionStatus as 'free' | 'pro' | 'lifetime',
    subscriptionExpiresAt: p.subscriptionExpiresAt?.toISOString() || null,
    selectedCategories: p.selectedCategories as Category[],
    dailyAffirmationCount: p.dailyAffirmationCount,
    canViewMoreAffirmations: p.dailyAffirmationCount < limit,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function updateUserProfile(
  userId: string,
  data: {
    selectedCategories?: Category[];
    timezone?: string;
  },
) {
  const profileUpdate: Record<string, unknown> = { updatedAt: new Date() };
  if (data.selectedCategories !== undefined) {
    profileUpdate.selectedCategories = data.selectedCategories;
  }
  if (data.timezone !== undefined) {
    profileUpdate.timezone = data.timezone;
  }

  if (Object.keys(profileUpdate).length > 1) {
    await db
      .update(userProfiles)
      .set(profileUpdate)
      .where(eq(userProfiles.userId, userId));
  }

  return getUserProfile(userId);
}

export async function incrementDailyCount(userId: string) {
  await db
    .update(userProfiles)
    .set({
      dailyAffirmationCount: sql`${userProfiles.dailyAffirmationCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));
}

export async function checkCanViewAffirmation(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile.canViewMoreAffirmations;
}

export async function deleteUser(userId: string) {
  // Delete user profile from server database if it exists
  try {
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
  } catch (err) {
    console.debug('userProfiles delete skipped:', err);
  }

  // Delete from Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Failed to delete Supabase user: ${error.message}`);
  }
}
