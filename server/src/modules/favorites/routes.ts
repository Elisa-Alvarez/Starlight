import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth/middleware.js';
import {
  getFavorites,
  getWidgetFavorites,
  addFavorite,
  removeFavorite,
  updateFavoriteWidget,
} from './service.js';
import { addFavoriteSchema, updateWidgetSchema } from './schemas.js';

export async function favoriteRoutes(app: FastifyInstance) {
  // Get all favorites
  app.get('/', { preHandler: [requireAuth] }, async (request) => {
    const favorites = await getFavorites(request.user!.id);
    return { success: true, data: favorites };
  });

  // Get widget-enabled favorites
  app.get('/widget', { preHandler: [requireAuth] }, async (request) => {
    const favorites = await getWidgetFavorites(request.user!.id);
    return { success: true, data: favorites };
  });

  // Add favorite
  app.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const input = addFavoriteSchema.parse(request.body);
    const favorite = await addFavorite(
      request.user!.id,
      input.affirmationId,
      input.widgetEnabled,
    );
    return reply.status(201).send({ success: true, data: favorite });
  });

  // Remove favorite
  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await removeFavorite(request.user!.id, id);
    return reply.status(204).send();
  });

  // Update widget settings
  app.patch('/:id/widget', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const input = updateWidgetSchema.parse(request.body);
    const favorite = await updateFavoriteWidget(request.user!.id, id, input);
    return { success: true, data: favorite };
  });
}
