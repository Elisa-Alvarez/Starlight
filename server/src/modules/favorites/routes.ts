import { requireAuth } from '../auth/middleware.js';
import {
  getFavorites,
  getWidgetFavorites,
  addFavorite,
  removeFavorite,
  updateFavoriteWidget,
} from './service.js';
import { addFavoriteSchema, updateWidgetSchema } from './schemas.js';

export async function favoriteRoutes(app: any) {
  // Get all favorites
  app.get('/', { preHandler: [requireAuth] }, async (request: any) => {
    const favorites = await getFavorites(request.user!.id);
    return { success: true, data: favorites };
  });

  // Get widget-enabled favorites
  app.get('/widget', { preHandler: [requireAuth] }, async (request: any) => {
    const favorites = await getWidgetFavorites(request.user!.id);
    return { success: true, data: favorites };
  });

  // Add favorite
  app.post('/', { preHandler: [requireAuth] }, async (request: any, reply: any) => {
    const input = addFavoriteSchema.parse(request.body);
    const favorite = await addFavorite(
      request.user!.id,
      input.affirmationId,
      input.widgetEnabled,
    );
    return reply.status(201).send({ success: true, data: favorite });
  });

  // Remove favorite
  app.delete('/:id', { preHandler: [requireAuth] }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    await removeFavorite(request.user!.id, id);
    return reply.status(204).send();
  });

  // Update widget settings
  app.patch('/:id/widget', { preHandler: [requireAuth] }, async (request: any) => {
    const { id } = request.params as { id: string };
    const input = updateWidgetSchema.parse(request.body);
    const favorite = await updateFavoriteWidget(request.user!.id, id, input);
    return { success: true, data: favorite };
  });
}
