import { z } from 'zod';
import { CATEGORIES, type Category } from '../../types/index.js';
import { APP_CONSTANTS } from '../../config/constants.js';

export const listAffirmationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(APP_CONSTANTS.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(APP_CONSTANTS.PAGINATION.MAX_LIMIT).default(APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
  category: z.enum(CATEGORIES as [string, ...string[]]).optional().transform(
    val => val as Category | undefined
  ),
  isPremium: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

export const trackViewSchema = z.object({
  source: z.enum(['app', 'widget', 'notification']).default('app'),
});

export type ListAffirmationsInput = z.infer<typeof listAffirmationsSchema>;
export type TrackViewInput = z.infer<typeof trackViewSchema>;
