import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
// @ts-ignore - Fastify v5 CJS export not compatible with moduleResolution: bundler
const createFastify = Fastify as any;
import { env, APP_CONSTANTS } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';

export async function buildApp() {
  const app = createFastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable for API
  });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: APP_CONSTANTS.RATE_LIMIT.GLOBAL.max,
    timeWindow: APP_CONSTANTS.RATE_LIMIT.GLOBAL.timeWindow,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.',
      },
    }),
  });

  // Allow empty body with application/json content-type
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req: any, body: any, done: any) => {
    if (!body || (typeof body === 'string' && body.trim() === '')) {
      done(null, undefined);
      return;
    }
    try {
      done(null, JSON.parse(body as string));
    } catch (err: any) {
      done(err, undefined);
    }
  });

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }));

  // API version prefix
  app.register(async (api: any) => {
    // Import and register modules
    const { userRoutes } = await import('./modules/users/routes.js');
    const { affirmationRoutes } = await import('./modules/affirmations/routes.js');
    const { favoriteRoutes } = await import('./modules/favorites/routes.js');
    const { widgetRoutes } = await import('./modules/widget/routes.js');
    const { subscriptionRoutes } = await import('./modules/subscriptions/routes.js');

    api.register(userRoutes, { prefix: '/users' });
    api.register(affirmationRoutes, { prefix: '/affirmations' });
    api.register(favoriteRoutes, { prefix: '/favorites' });
    api.register(widgetRoutes, { prefix: '/widget' });
    api.register(subscriptionRoutes, { prefix: '/subscriptions' });
  }, { prefix: '/api' });

  return app;
}
