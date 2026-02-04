import { pgTable, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const affirmations = pgTable('affirmations', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  backgroundUrl: text('background_url'),
  backgroundThumbnailUrl: text('background_thumbnail_url'),
  backgroundColorPrimary: text('background_color_primary'),
  backgroundColorSecondary: text('background_color_secondary'),
  displayColor: text('display_color'),
  isPremium: boolean('is_premium').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type Affirmation = typeof affirmations.$inferSelect;
export type NewAffirmation = typeof affirmations.$inferInsert;
