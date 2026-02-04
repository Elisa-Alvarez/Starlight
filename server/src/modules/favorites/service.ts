import { eq, and } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { favoriteAffirmations } from '../../db/schema/favorites.js';
import { affirmations } from '../../db/schema/affirmations.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../middleware/error-handler.js';
import type { Category, FavoriteResponse } from '../../types/index.js';

export async function getFavorites(userId: string): Promise<FavoriteResponse[]> {
  const result = await db
    .select({
      favorite: favoriteAffirmations,
      affirmation: affirmations,
    })
    .from(favoriteAffirmations)
    .innerJoin(affirmations, eq(favoriteAffirmations.affirmationId, affirmations.id))
    .where(eq(favoriteAffirmations.userId, userId))
    .orderBy(favoriteAffirmations.createdAt);

  return result.map(r => ({
    id: r.favorite.id,
    affirmation: {
      id: r.affirmation.id,
      text: r.affirmation.text,
      category: r.affirmation.categoryId as Category,
      backgroundUrl: r.affirmation.backgroundUrl,
      backgroundThumbnailUrl: r.affirmation.backgroundThumbnailUrl,
      backgroundColorPrimary: r.affirmation.backgroundColorPrimary,
      backgroundColorSecondary: r.affirmation.backgroundColorSecondary,
      displayColor: r.affirmation.displayColor,
      isPremium: r.affirmation.isPremium,
    },
    widgetEnabled: r.favorite.widgetEnabled,
    widgetOrder: r.favorite.widgetOrder,
    createdAt: r.favorite.createdAt.toISOString(),
  }));
}

export async function getWidgetFavorites(userId: string): Promise<FavoriteResponse[]> {
  const result = await db
    .select({
      favorite: favoriteAffirmations,
      affirmation: affirmations,
    })
    .from(favoriteAffirmations)
    .innerJoin(affirmations, eq(favoriteAffirmations.affirmationId, affirmations.id))
    .where(and(
      eq(favoriteAffirmations.userId, userId),
      eq(favoriteAffirmations.widgetEnabled, true),
    ))
    .orderBy(favoriteAffirmations.widgetOrder, favoriteAffirmations.createdAt);

  return result.map(r => ({
    id: r.favorite.id,
    affirmation: {
      id: r.affirmation.id,
      text: r.affirmation.text,
      category: r.affirmation.categoryId as Category,
      backgroundUrl: r.affirmation.backgroundUrl,
      backgroundThumbnailUrl: r.affirmation.backgroundThumbnailUrl,
      backgroundColorPrimary: r.affirmation.backgroundColorPrimary,
      backgroundColorSecondary: r.affirmation.backgroundColorSecondary,
      displayColor: r.affirmation.displayColor,
      isPremium: r.affirmation.isPremium,
    },
    widgetEnabled: r.favorite.widgetEnabled,
    widgetOrder: r.favorite.widgetOrder,
    createdAt: r.favorite.createdAt.toISOString(),
  }));
}

export async function addFavorite(
  userId: string,
  affirmationId: string,
  widgetEnabled = false,
): Promise<FavoriteResponse> {
  // Verify affirmation exists
  const aff = await db
    .select()
    .from(affirmations)
    .where(eq(affirmations.id, affirmationId))
    .limit(1);

  if (aff.length === 0) {
    throw new NotFoundError('Affirmation not found');
  }

  // Check for duplicate
  const existing = await db
    .select()
    .from(favoriteAffirmations)
    .where(and(
      eq(favoriteAffirmations.userId, userId),
      eq(favoriteAffirmations.affirmationId, affirmationId),
    ))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError('Affirmation already in favorites');
  }

  const [favorite] = await db
    .insert(favoriteAffirmations)
    .values({
      userId,
      affirmationId,
      widgetEnabled,
    })
    .returning();

  return {
    id: favorite.id,
    affirmation: {
      id: aff[0].id,
      text: aff[0].text,
      category: aff[0].categoryId as Category,
      backgroundUrl: aff[0].backgroundUrl,
      backgroundThumbnailUrl: aff[0].backgroundThumbnailUrl,
      backgroundColorPrimary: aff[0].backgroundColorPrimary,
      backgroundColorSecondary: aff[0].backgroundColorSecondary,
      displayColor: aff[0].displayColor,
      isPremium: aff[0].isPremium,
    },
    widgetEnabled: favorite.widgetEnabled,
    widgetOrder: favorite.widgetOrder,
    createdAt: favorite.createdAt.toISOString(),
  };
}

export async function removeFavorite(userId: string, favoriteId: string): Promise<void> {
  const result = await db
    .delete(favoriteAffirmations)
    .where(and(
      eq(favoriteAffirmations.id, favoriteId),
      eq(favoriteAffirmations.userId, userId),
    ))
    .returning();

  if (result.length === 0) {
    throw new NotFoundError('Favorite not found');
  }
}

export async function updateFavoriteWidget(
  userId: string,
  favoriteId: string,
  data: { widgetEnabled?: boolean; widgetOrder?: number },
): Promise<FavoriteResponse> {
  const existing = await db
    .select({
      favorite: favoriteAffirmations,
      affirmation: affirmations,
    })
    .from(favoriteAffirmations)
    .innerJoin(affirmations, eq(favoriteAffirmations.affirmationId, affirmations.id))
    .where(and(
      eq(favoriteAffirmations.id, favoriteId),
      eq(favoriteAffirmations.userId, userId),
    ))
    .limit(1);

  if (existing.length === 0) {
    throw new NotFoundError('Favorite not found');
  }

  const [updated] = await db
    .update(favoriteAffirmations)
    .set({
      widgetEnabled: data.widgetEnabled ?? existing[0].favorite.widgetEnabled,
      widgetOrder: data.widgetOrder ?? existing[0].favorite.widgetOrder,
    })
    .where(eq(favoriteAffirmations.id, favoriteId))
    .returning();

  return {
    id: updated.id,
    affirmation: {
      id: existing[0].affirmation.id,
      text: existing[0].affirmation.text,
      category: existing[0].affirmation.categoryId as Category,
      backgroundUrl: existing[0].affirmation.backgroundUrl,
      backgroundThumbnailUrl: existing[0].affirmation.backgroundThumbnailUrl,
      backgroundColorPrimary: existing[0].affirmation.backgroundColorPrimary,
      backgroundColorSecondary: existing[0].affirmation.backgroundColorSecondary,
      displayColor: existing[0].affirmation.displayColor,
      isPremium: existing[0].affirmation.isPremium,
    },
    widgetEnabled: updated.widgetEnabled,
    widgetOrder: updated.widgetOrder,
    createdAt: updated.createdAt.toISOString(),
  };
}
