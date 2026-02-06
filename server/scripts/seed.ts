import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories } from '../src/db/schema/categories.js';
import { affirmations } from '../src/db/schema/affirmations.js';
import { CATEGORY_SEED } from '../src/db/seed/categories.js';
import { AFFIRMATION_SEED } from '../src/db/seed/affirmations.js';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  console.log('Seeding database...');

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  // Seed categories
  console.log(`Seeding ${CATEGORY_SEED.length} categories...`);
  await db.insert(categories).values(CATEGORY_SEED).onConflictDoNothing();

  // Seed affirmations
  console.log(`Seeding ${AFFIRMATION_SEED.length} affirmations...`);
  await db.insert(affirmations).values(AFFIRMATION_SEED).onConflictDoNothing();

  console.log('Seeding completed!');
  console.log(`- ${CATEGORY_SEED.length} categories`);
  console.log(`- ${AFFIRMATION_SEED.length} affirmations`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
