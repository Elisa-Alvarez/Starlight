import { requireAuth } from '../auth/middleware.js';
import {
  getSubscriptionStatus,
  linkRevenueCatUser,
  processWebhook,
  restorePurchases,
} from './service.js';
import { linkRevenueCatSchema, webhookPayloadSchema } from './schemas.js';
import type { RevenueCatWebhookPayload } from './types.js';

export async function subscriptionRoutes(app: any) {
  // Get subscription status
  app.get('/status', { preHandler: [requireAuth] }, async (request: any) => {
    const status = await getSubscriptionStatus(request.user!.id);
    return { success: true, data: status };
  });

  // Link RevenueCat user ID to account
  app.post('/link', { preHandler: [requireAuth] }, async (request: any, reply: any) => {
    const input = linkRevenueCatSchema.parse(request.body);
    await linkRevenueCatUser(request.user!.id, input.revenuecatUserId);
    return reply.status(204).send();
  });

  // Restore purchases
  app.post('/restore', { preHandler: [requireAuth] }, async (request: any) => {
    const status = await restorePurchases(request.user!.id);
    return { success: true, data: status };
  });

  // RevenueCat webhook endpoint
  app.post('/webhook', async (request: any, reply: any) => {
    const signature = request.headers['x-revenuecat-signature'] as string || '';
    const validated = webhookPayloadSchema.parse(request.body);

    // Cast to full type - webhook schema is partial for validation
    const payload = validated as unknown as RevenueCatWebhookPayload;

    await processWebhook(payload, signature);
    return reply.status(200).send({ received: true });
  });
}
