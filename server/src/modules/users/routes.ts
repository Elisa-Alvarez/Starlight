import { requireAuth } from '../auth/middleware.js';
import { getUserProfile, updateUserProfile, deleteUser, getUserStreak } from './service.js';
import { updateUserSchema } from './schemas.js';

export async function userRoutes(app: any) {
  // Get current user profile
  app.get('/me', { preHandler: [requireAuth] }, async (request: any) => {
    const profile = await getUserProfile(request.user!.id);
    return { success: true, data: profile };
  });

  // Update current user profile
  app.patch('/me', { preHandler: [requireAuth] }, async (request: any) => {
    const input = updateUserSchema.parse(request.body);
    const profile = await updateUserProfile(request.user!.id, input);
    return { success: true, data: profile };
  });

  // Update selected categories
  app.put('/me/categories', { preHandler: [requireAuth] }, async (request: any) => {
    const { categories } = request.body as { categories: string[] };
    const input = updateUserSchema.parse({ selectedCategories: categories });
    const profile = await updateUserProfile(request.user!.id, input);
    return { success: true, data: profile };
  });

  // Get streak data
  app.get('/me/streak', { preHandler: [requireAuth] }, async (request: any) => {
    const streak = await getUserStreak(request.user!.id);
    return { success: true, data: streak };
  });

  // Delete account
  app.delete('/me', { preHandler: [requireAuth] }, async (request: any) => {
    request.log.info({ userId: request.user!.id }, 'Deleting user account');
    await deleteUser(request.user!.id);
    return { success: true };
  });
}
