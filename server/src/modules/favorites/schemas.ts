import { z } from 'zod';

export const addFavoriteSchema = z.object({
  affirmationId: z.string().min(1),
  widgetEnabled: z.boolean().default(false),
});

export const updateWidgetSchema = z.object({
  widgetEnabled: z.boolean().optional(),
  widgetOrder: z.number().int().min(0).optional(),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
