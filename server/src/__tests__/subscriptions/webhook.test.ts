import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db.js', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

vi.mock('../../lib/redis.js', () => ({
  cacheDelete: vi.fn(),
}));

vi.mock('../../db/schema/users.js', () => ({
  userProfiles: { userId: 'userId', revenuecatUserId: 'revenuecatUserId' },
}));

vi.mock('../../db/schema/subscriptions.js', () => ({
  subscriptionEvents: { id: 'id', eventId: 'eventId' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

const mockEnv: Record<string, unknown> = {
  NODE_ENV: 'development',
  REVENUECAT_WEBHOOK_SECRET: 'test-secret-123',
};

vi.mock('../../config/env.js', () => ({
  env: new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      return mockEnv[prop as string];
    },
  }),
}));

vi.mock('../../config/constants.js', () => ({
  APP_CONSTANTS: {},
}));

const makePayload = () => ({
  event: {
    id: 'evt-123',
    type: 'INITIAL_PURCHASE' as const,
    app_user_id: 'rc-user-456',
    product_id: 'pro_monthly',
    transaction_id: 'txn-789',
    original_transaction_id: 'txn-789',
    purchased_at_ms: Date.now(),
    expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
    price: 4.99,
    currency: 'USD',
  },
});

function signPayload(payload: object, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.REVENUECAT_WEBHOOK_SECRET = 'test-secret-123';
});

describe('processWebhook', () => {
  it('accepts valid signature', async () => {
    const { processWebhook } = await import('../../modules/subscriptions/service.js');

    const payload = makePayload();
    const signature = signPayload(payload, 'test-secret-123');

    await expect(processWebhook(payload as any, signature)).resolves.not.toThrow();
  });

  it('throws UnauthorizedError for invalid signature', async () => {
    const { processWebhook } = await import('../../modules/subscriptions/service.js');

    const payload = makePayload();
    const badSignature = 'a'.repeat(64);

    await expect(processWebhook(payload as any, badSignature)).rejects.toThrow(
      'Invalid webhook signature',
    );
  });

  it('throws UnauthorizedError when secret is not configured', async () => {
    mockEnv.REVENUECAT_WEBHOOK_SECRET = '';

    const { processWebhook } = await import('../../modules/subscriptions/service.js');

    const payload = makePayload();

    await expect(processWebhook(payload as any, 'any-sig')).rejects.toThrow(
      'Webhook secret not configured',
    );
  });
});
