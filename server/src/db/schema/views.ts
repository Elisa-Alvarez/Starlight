import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './users.js';
import { affirmations } from './affirmations.js';

export const affirmationViews = pgTable('affirmation_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  affirmationId: text('affirmation_id').notNull().references(() => affirmations.id, { onDelete: 'cascade' }),
  source: text('source').notNull(), // 'app', 'widget', 'notification'
  viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AffirmationView = typeof affirmationViews.$inferSelect;
export type NewAffirmationView = typeof affirmationViews.$inferInsert;
