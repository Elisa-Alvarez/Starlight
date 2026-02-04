import { optionalAuth, requireAuth } from '../auth/middleware.js';
import {
  getCategories,
  getAffirmations,
  getAffirmationById,
  getDailyAffirmations,
  getRandomAffirmation,
  trackAffirmationView,
} from './service.js';
import { listAffirmationsSchema, trackViewSchema } from './schemas.js';
import type { Category } from '../../types/index.js';

export async function affirmationRoutes(app: any) {
  // Get all categories
  app.get('/categories', async () => {
    const categories = await getCategories();
    return { success: true, data: categories };
  });

  // Get affirmations by category
  app.get('/categories/:categoryId', { preHandler: [optionalAuth] }, async (request: any) => {
    const { categoryId } = request.params as { categoryId: string };
    const query = listAffirmationsSchema.parse(request.query);

    const isPro = request.user
      ? (await import('../users/service.js')).getUserProfile(request.user.id)
          .then(p => p.subscriptionStatus === 'pro' || p.subscriptionStatus === 'lifetime')
      : false;

    const result = await getAffirmations({
      ...query,
      category: categoryId as Category,
      userIsPro: await isPro,
    });

    return {
      success: true,
      data: result.affirmations,
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        hasMore: query.page * query.limit < result.total,
      },
    };
  });

  // List affirmations with pagination
  app.get('/', { preHandler: [optionalAuth] }, async (request: any) => {
    const query = listAffirmationsSchema.parse(request.query);

    const isPro = request.user
      ? (await import('../users/service.js')).getUserProfile(request.user.id)
          .then(p => p.subscriptionStatus === 'pro' || p.subscriptionStatus === 'lifetime')
      : false;

    const result = await getAffirmations({
      ...query,
      userIsPro: await isPro,
    });

    return {
      success: true,
      data: result.affirmations,
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        hasMore: query.page * query.limit < result.total,
      },
    };
  });

  // Get daily affirmations (enforces freemium limit)
  app.get('/daily', { preHandler: [optionalAuth] }, async (request: any) => {
    const result = await getDailyAffirmations(request.user?.id);

    return {
      success: true,
      data: {
        affirmations: result.affirmations,
        remainingViews: result.remainingViews,
        requiresPremium: result.requiresPremium,
      },
    };
  });

  // Get random affirmation
  app.get('/random', { preHandler: [optionalAuth] }, async (request: any) => {
    let selectedCategories: Category[] | undefined;
    let isPro = false;

    if (request.user) {
      const profile = await (await import('../users/service.js')).getUserProfile(request.user.id);
      selectedCategories = profile.selectedCategories;
      isPro = profile.subscriptionStatus === 'pro' || profile.subscriptionStatus === 'lifetime';
    }

    const affirmation = await getRandomAffirmation(selectedCategories, isPro);
    return { success: true, data: affirmation };
  });

  // Get single affirmation
  app.get('/:id', { preHandler: [optionalAuth] }, async (request: any) => {
    const { id } = request.params as { id: string };

    const isPro = request.user
      ? (await import('../users/service.js')).getUserProfile(request.user.id)
          .then(p => p.subscriptionStatus === 'pro' || p.subscriptionStatus === 'lifetime')
      : false;

    const affirmation = await getAffirmationById(id, await isPro);
    return { success: true, data: affirmation };
  });

  // Track affirmation view
  app.post('/:id/view', { preHandler: [optionalAuth] }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const { source } = trackViewSchema.parse(request.body || {});

    await trackAffirmationView(id, request.user?.id, source);
    return reply.status(204).send();
  });
}
