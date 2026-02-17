import { pgTable, text, boolean, integer, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { userProfiles } from './users.js';
import { affirmations } from './affirmations.js';

export const favoriteAffirmations = pgTable('favorite_affirmations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => userProfiles.userId, { onDelete: 'cascade' }),
  affirmationId: text('affirmation_id').notNull().references(() => affirmations.id, { onDelete: 'cascade' }),
  widgetEnabled: boolean('widget_enabled').notNull().default(false),
  widgetOrder: integer('widget_order'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userAffirmationUnique: unique().on(table.userId, table.affirmationId),
})).enableRLS();

export type FavoriteAffirmation = typeof favoriteAffirmations.$inferSelect;
export type NewFavoriteAffirmation = typeof favoriteAffirmations.$inferInsert;
