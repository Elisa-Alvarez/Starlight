import { z } from 'zod';

export const linkRevenueCatSchema = z.object({
  revenuecatUserId: z.string().min(1),
});

export const webhookPayloadSchema = z.object({
  api_version: z.string(),
  event: z.object({
    id: z.string(),
    type: z.string(),
    app_user_id: z.string(),
    product_id: z.string().optional(),
    transaction_id: z.string().optional(),
    original_transaction_id: z.string().optional(),
    purchased_at_ms: z.number().optional(),
    expiration_at_ms: z.number().nullable().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
  }).passthrough(),
});

export type LinkRevenueCatInput = z.infer<typeof linkRevenueCatSchema>;
