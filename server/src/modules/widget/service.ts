import { eq, and, inArray, sql } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { affirmations } from '../../db/schema/affirmations.js';
import { favoriteAffirmations } from '../../db/schema/favorites.js';
import { getUserProfile } from '../users/service.js';
import type { Category, WidgetAffirmationResponse } from '../../types/index.js';

export async function getWidgetAffirmation(userId: string): Promise<WidgetAffirmationResponse> {
  const profile = await getUserProfile(userId);

  // First, try to get a widget-enabled favorite
  const favorites = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      categoryId: affirmations.categoryId,
      backgroundUrl: affirmations.backgroundUrl,
    })
    .from(favoriteAffirmations)
    .innerJoin(affirmations, eq(favoriteAffirmations.affirmationId, affirmations.id))
    .where(and(
      eq(favoriteAffirmations.userId, userId),
      eq(favoriteAffirmations.widgetEnabled, true),
    ))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (favorites.length > 0) {
    return {
      id: favorites[0].id,
      text: favorites[0].text,
      category: favorites[0].categoryId as Category,
      backgroundUrl: favorites[0].backgroundUrl,
    };
  }

  // Fall back to random affirmation from selected categories
  const isPro = profile.subscriptionStatus === 'pro' || profile.subscriptionStatus === 'lifetime';
  const conditions = [eq(affirmations.isActive, true)];

  if (!isPro) {
    conditions.push(eq(affirmations.isPremium, false));
  }

  if (profile.selectedCategories.length > 0) {
    conditions.push(inArray(affirmations.categoryId, profile.selectedCategories));
  }

  const result = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      categoryId: affirmations.categoryId,
      backgroundUrl: affirmations.backgroundUrl,
    })
    .from(affirmations)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (result.length === 0) {
    // Fallback to any active affirmation
    const fallback = await db
      .select({
        id: affirmations.id,
        text: affirmations.text,
        categoryId: affirmations.categoryId,
        backgroundUrl: affirmations.backgroundUrl,
      })
      .from(affirmations)
      .where(and(
        eq(affirmations.isActive, true),
        eq(affirmations.isPremium, false),
      ))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return {
      id: fallback[0].id,
      text: fallback[0].text,
      category: fallback[0].categoryId as Category,
      backgroundUrl: fallback[0].backgroundUrl,
    };
  }

  return {
    id: result[0].id,
    text: result[0].text,
    category: result[0].categoryId as Category,
    backgroundUrl: result[0].backgroundUrl,
  };
}

export async function getWidgetFavorites(userId: string): Promise<WidgetAffirmationResponse[]> {
  const result = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      categoryId: affirmations.categoryId,
      backgroundUrl: affirmations.backgroundUrl,
    })
    .from(favoriteAffirmations)
    .innerJoin(affirmations, eq(favoriteAffirmations.affirmationId, affirmations.id))
    .where(and(
      eq(favoriteAffirmations.userId, userId),
      eq(favoriteAffirmations.widgetEnabled, true),
    ))
    .orderBy(favoriteAffirmations.widgetOrder, favoriteAffirmations.createdAt);

  return result.map(r => ({
    id: r.id,
    text: r.text,
    category: r.categoryId as Category,
    backgroundUrl: r.backgroundUrl,
  }));
}

export async function getDailyWidgetAffirmation(userId: string): Promise<WidgetAffirmationResponse> {
  // Use date-based seed for consistent daily affirmation
  const today = new Date().toISOString().split('T')[0];
  const seed = hashCode(userId + today);

  const profile = await getUserProfile(userId);
  const isPro = profile.subscriptionStatus === 'pro' || profile.subscriptionStatus === 'lifetime';

  const conditions = [eq(affirmations.isActive, true)];

  if (!isPro) {
    conditions.push(eq(affirmations.isPremium, false));
  }

  if (profile.selectedCategories.length > 0) {
    conditions.push(inArray(affirmations.categoryId, profile.selectedCategories));
  }

  const all = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      categoryId: affirmations.categoryId,
      backgroundUrl: affirmations.backgroundUrl,
    })
    .from(affirmations)
    .where(and(...conditions));

  if (all.length === 0) {
    return getWidgetAffirmation(userId);
  }

  const index = Math.abs(seed) % all.length;
  const selected = all[index];

  return {
    id: selected.id,
    text: selected.text,
    category: selected.categoryId as Category,
    backgroundUrl: selected.backgroundUrl,
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
