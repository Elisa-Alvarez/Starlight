import { eq, sql, desc } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { userProfiles } from '../../db/schema/users.js';
import { affirmationViews } from '../../db/schema/views.js';
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
    const trialEndsAt = new Date(Date.now() + APP_CONSTANTS.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    await db.insert(userProfiles).values({ userId, trialEndsAt }).onConflictDoNothing();
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
    trialEndsAt: p.trialEndsAt?.toISOString() || null,
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

export async function getUserStreak(userId: string) {
  // Get all distinct view dates for the user
  const rows = await db
    .select({
      viewDate: sql<string>`DATE(${affirmationViews.viewedAt})`.as('view_date'),
    })
    .from(affirmationViews)
    .where(eq(affirmationViews.userId, userId))
    .groupBy(sql`DATE(${affirmationViews.viewedAt})`)
    .orderBy(desc(sql`DATE(${affirmationViews.viewedAt})`));

  const viewDates = rows.map((r) => r.viewDate);

  if (viewDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, viewDates: [] };
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak: must include today or yesterday
  if (viewDates[0] === today || viewDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < viewDates.length; i++) {
      const curr = new Date(viewDates[i - 1]);
      const prev = new Date(viewDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  longestStreak = 1;
  streak = 1;
  for (let i = 1; i < viewDates.length; i++) {
    const curr = new Date(viewDates[i - 1]);
    const prev = new Date(viewDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    viewDates,
  };
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
