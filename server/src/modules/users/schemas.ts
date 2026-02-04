import { z } from 'zod';
import { CATEGORIES, type Category } from '../../types/index.js';

export const updateUserSchema = z.object({
  selectedCategories: z.array(z.enum(CATEGORIES as [string, ...string[]])).optional().transform(
    val => val as Category[] | undefined
  ),
  timezone: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
