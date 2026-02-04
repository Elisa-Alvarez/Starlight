import { requireAuth } from '../auth/middleware.js';
import {
  getWidgetAffirmation,
  getWidgetFavorites,
  getDailyWidgetAffirmation,
} from './service.js';

export async function widgetRoutes(app: any) {
  // Get random affirmation for widget
  app.get('/affirmation', { preHandler: [requireAuth] }, async (request: any) => {
    const affirmation = await getWidgetAffirmation(request.user!.id);
    return { success: true, data: affirmation };
  });

  // Get widget favorites (minimal payload)
  app.get('/favorites', { preHandler: [requireAuth] }, async (request: any) => {
    const favorites = await getWidgetFavorites(request.user!.id);
    return { success: true, data: favorites };
  });

  // Get daily affirmation for widget (consistent per day)
  app.get('/daily', { preHandler: [requireAuth] }, async (request: any) => {
    const affirmation = await getDailyWidgetAffirmation(request.user!.id);
    return { success: true, data: affirmation };
  });
}
