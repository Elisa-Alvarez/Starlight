import { eq, and, inArray, sql, count } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { affirmations } from '../../db/schema/affirmations.js';
import { categories } from '../../db/schema/categories.js';
import { affirmationViews } from '../../db/schema/views.js';
import { cacheGet, cacheSet } from '../../lib/redis.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { NotFoundError, ForbiddenError } from '../../middleware/error-handler.js';
import { getUserProfile, incrementDailyCount } from '../users/service.js';
import type { Category, AffirmationResponse, CategoryInfoResponse, PaginationParams } from '../../types/index.js';

export async function getCategories(): Promise<CategoryInfoResponse[]> {
  const cacheKey = 'categories:all';
  const cached = await cacheGet<CategoryInfoResponse[]>(cacheKey);
  if (cached) return cached;

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      emoji: categories.emoji,
      affirmationCount: sql<number>`count(${affirmations.id})::int`,
    })
    .from(categories)
    .leftJoin(affirmations, and(
      eq(affirmations.categoryId, categories.id),
      eq(affirmations.isActive, true),
    ))
    .groupBy(categories.id)
    .orderBy(categories.displayOrder);

  const data = result.map(r => ({
    ...r,
    id: r.id as Category,
  }));

  await cacheSet(cacheKey, data, APP_CONSTANTS.CACHE_TTL.CATEGORIES);
  return data;
}

export async function getAffirmations(
  params: PaginationParams & {
    category?: Category;
    isPremium?: boolean;
    userIsPro?: boolean;
  },
): Promise<{ affirmations: AffirmationResponse[]; total: number }> {
  const { page, limit, category, isPremium, userIsPro } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(affirmations.isActive, true)];

  if (category) {
    conditions.push(eq(affirmations.categoryId, category));
  }

  // Filter premium content based on user status
  if (!userIsPro) {
    conditions.push(eq(affirmations.isPremium, false));
  } else if (isPremium !== undefined) {
    conditions.push(eq(affirmations.isPremium, isPremium));
  }

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(affirmations)
      .where(and(...conditions))
      .orderBy(affirmations.displayOrder, affirmations.id)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(affirmations)
      .where(and(...conditions)),
  ]);

  return {
    affirmations: data.map(mapAffirmationResponse),
    total: countResult[0].count,
  };
}

export async function getAffirmationById(id: string, userIsPro = false): Promise<AffirmationResponse> {
  const result = await db
    .select()
    .from(affirmations)
    .where(and(
      eq(affirmations.id, id),
      eq(affirmations.isActive, true),
    ))
    .limit(1);

  if (result.length === 0) {
    throw new NotFoundError('Affirmation not found');
  }

  const affirmation = result[0];

  if (affirmation.isPremium && !userIsPro) {
    throw new ForbiddenError('Premium subscription required');
  }

  return mapAffirmationResponse(affirmation);
}

export async function getDailyAffirmations(
  userId?: string,
  selectedCategories?: Category[],
): Promise<{ affirmations: AffirmationResponse[]; remainingViews: number; requiresPremium: boolean }> {
  let isPro = false;
  let dailyCount = 0;
  let limit: number = APP_CONSTANTS.FREE_DAILY_AFFIRMATION_LIMIT;

  if (userId) {
    const profile = await getUserProfile(userId);
    isPro = profile.subscriptionStatus === 'pro' || profile.subscriptionStatus === 'lifetime';
    dailyCount = profile.dailyAffirmationCount;
    limit = isPro ? APP_CONSTANTS.PRO_DAILY_AFFIRMATION_LIMIT : APP_CONSTANTS.FREE_DAILY_AFFIRMATION_LIMIT;
    selectedCategories = selectedCategories || profile.selectedCategories;
  }

  const remaining = Math.max(0, limit - dailyCount);

  if (remaining === 0 && !isPro) {
    return {
      affirmations: [],
      remainingViews: 0,
      requiresPremium: true,
    };
  }

  // Get random affirmations from selected categories
  const conditions = [eq(affirmations.isActive, true)];

  if (!isPro) {
    conditions.push(eq(affirmations.isPremium, false));
  }

  if (selectedCategories && selectedCategories.length > 0) {
    conditions.push(inArray(affirmations.categoryId, selectedCategories));
  }

  const result = await db
    .select()
    .from(affirmations)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(Math.min(remaining, 10));

  return {
    affirmations: result.map(mapAffirmationResponse),
    remainingViews: isPro ? -1 : remaining, // -1 means unlimited
    requiresPremium: false,
  };
}

export async function getRandomAffirmation(
  selectedCategories?: Category[],
  userIsPro = false,
): Promise<AffirmationResponse> {
  const conditions = [eq(affirmations.isActive, true)];

  if (!userIsPro) {
    conditions.push(eq(affirmations.isPremium, false));
  }

  if (selectedCategories && selectedCategories.length > 0) {
    conditions.push(inArray(affirmations.categoryId, selectedCategories));
  }

  const result = await db
    .select()
    .from(affirmations)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (result.length === 0) {
    throw new NotFoundError('No affirmations found');
  }

  return mapAffirmationResponse(result[0]);
}

export async function trackAffirmationView(
  affirmationId: string,
  userId?: string,
  source: 'app' | 'widget' | 'notification' = 'app',
): Promise<void> {
  // Verify affirmation exists
  const affirmation = await db
    .select({ id: affirmations.id })
    .from(affirmations)
    .where(eq(affirmations.id, affirmationId))
    .limit(1);

  if (affirmation.length === 0) {
    throw new NotFoundError('Affirmation not found');
  }

  // Record view
  await db.insert(affirmationViews).values({
    affirmationId,
    userId: userId || null,
    source,
  });

  // Increment user's daily count if authenticated
  if (userId) {
    await incrementDailyCount(userId);
  }
}

function mapAffirmationResponse(a: typeof affirmations.$inferSelect): AffirmationResponse {
  return {
    id: a.id,
    text: a.text,
    category: a.categoryId as Category,
    backgroundUrl: a.backgroundUrl,
    backgroundThumbnailUrl: a.backgroundThumbnailUrl,
    backgroundColorPrimary: a.backgroundColorPrimary,
    backgroundColorSecondary: a.backgroundColorSecondary,
    displayColor: a.displayColor,
    isPremium: a.isPremium,
  };
}
