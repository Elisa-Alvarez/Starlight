# Starlight

A brutally simple affirmation app. Like a friend texting you something nice each day.

## Philosophy

- **No toxic positivity** — Just honest, real support
- **Passive delivery** — Notifications bring affirmations to you
- **No pressure** — No streaks, no gamification, no guilt
- **Always visible** — Designed for widgets and lock screen

## Features

### Star Mascot
A peaceful, friendly star companion. Simple and calm.

### Honest Affirmations
170+ affirmations that acknowledge life can be hard:
- Anxiety & Stress
- Winter Darkness
- Energy & Motivation
- Self-Care
- Mindfulness
- Sleep & Rest
- Focus
- Overthinking
- Peace
- Hard Days

### Gentle Notifications
- Morning motivation
- Midday check-in
- Afternoon boost
- Evening wind-down
- Before bed

Pick the times that work for you.

### Dark Mode
Easy on the eyes, day or night.

### Widget Support
Affirmations on your lock screen and home screen without opening the app.

### Favorites
Save affirmations that resonate. Synced across devices when signed in.

## What This App Is NOT

- No streaks or gamification
- No "manifest abundance" toxic positivity
- No forcing you to open the app daily
- No mood tracking or data collection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Client** | React Native 0.81 / Expo 54 (TypeScript) |
| **Server** | Fastify v5 + Drizzle ORM |
| **Database** | PostgreSQL (Supabase) |
| **Cache** | Upstash Redis |
| **Auth** | Supabase Auth (Google, Apple, Email) |
| **Subscriptions** | RevenueCat |
| **Analytics** | PostHog |
| **State** | Zustand + React Query |
| **Testing** | Jest (client), Vitest (server) |

## Getting Started

### Prerequisites

- Node.js >= 20
- iOS Simulator (Xcode) or Android Emulator
- PostgreSQL database (or Supabase project)

### Client Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your keys (see Environment Variables below)

# Start the dev server
npx expo start

# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
```

### Server Setup

```bash
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your database URL and keys

# Run database migrations
npx drizzle-kit push

# Seed the database
npx tsx src/db/seed/index.ts

# Start the server
npm run dev
```

### Running Tests

```bash
# Client tests (from project root)
npm test

# Server tests
cd server && npm test
```

## Environment Variables

### Client (`.env`)

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend API URL (e.g. `http://localhost:3000`) |
| `REVENUECAT_API_KEY_APPLE` | RevenueCat Apple API key |
| `REVENUECAT_API_KEY_GOOGLE` | RevenueCat Google API key |
| `POSTHOG_API_KEY` | PostHog analytics key |
| `POSTHOG_HOST` | PostHog host URL |

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | Server port (default `3000`) |
| `HOST` | Server host (default `0.0.0.0`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat webhook signing secret (required in production) |
| `UPSTASH_REDIS_URL` | Upstash Redis URL (optional in dev) |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis token (optional in dev) |
| `CORS_ORIGINS` | Allowed origins, comma-separated |

## Project Structure

```
starlight/
├── src/                        # React Native client
│   ├── components/             # UI components (StarMascot, AffirmationCard, ErrorBoundary)
│   │   ├── home/               # Home screen components
│   │   └── ui/                 # Reusable primitives (Button, Card, Input)
│   ├── screens/                # App screens
│   │   ├── OnboardingScreen    # Category selection, notification setup, trial
│   │   ├── LoginScreen         # Email/password and OAuth sign-in
│   │   ├── HomeScreen          # Daily affirmations feed
│   │   ├── FavoritesScreen     # Saved affirmations
│   │   ├── ProgressScreen      # Streak tracking and stats
│   │   ├── ProfileScreen       # User profile and account
│   │   ├── BrowseScreen        # Browse all categories
│   │   ├── SettingsScreen      # Preferences (notifications, theme)
│   │   ├── PaywallScreen       # Subscription options
│   │   └── ...                 # DailyAffirmation, Customize, Widget, CreateMix
│   ├── navigation/             # React Navigation (stack + bottom tabs)
│   ├── services/               # API client, auth, RevenueCat, favorites
│   ├── store/                  # Zustand stores (auth, subscription, favorites, settings)
│   ├── hooks/                  # React Query hooks (useAffirmations, useFavorites, useCategories)
│   ├── providers/              # Context providers (auth, React Query)
│   ├── data/                   # Hardcoded fallback affirmations
│   ├── lib/                    # Supabase client setup
│   ├── constants/              # Theme colors, spacing, fonts
│   ├── types/                  # TypeScript type definitions
│   └── __tests__/              # Jest unit tests
├── server/                     # Fastify API server
│   └── src/
│       ├── modules/            # Feature modules
│       │   ├── affirmations/   # GET /api/affirmations, categories
│       │   ├── favorites/      # CRUD /api/favorites
│       │   ├── users/          # GET/DELETE /api/users
│       │   ├── subscriptions/  # Status, RevenueCat webhooks
│       │   ├── widget/         # GET /api/widget
│       │   └── auth/           # JWT verification middleware
│       ├── db/
│       │   ├── schema/         # Drizzle table definitions
│       │   ├── migrations/     # SQL migration files
│       │   └── seed/           # Database seeding scripts
│       ├── config/             # Environment validation, constants
│       ├── middleware/         # Error handler
│       ├── lib/                # Supabase admin client, Redis
│       └── __tests__/          # Vitest unit tests
├── assets/                     # App icons, splash screen, fonts
├── App.tsx                     # Root component (splash, providers, navigation)
├── app.json                    # Expo configuration
└── jest.config.js              # Client test configuration
```

## API Endpoints

All routes are prefixed with `/api`. Authenticated routes require a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `GET` | `/api/affirmations` | Yes | List affirmations (with category filter) |
| `GET` | `/api/affirmations/categories` | Yes | List categories |
| `GET` | `/api/favorites` | Yes | Get user's favorites |
| `POST` | `/api/favorites` | Yes | Add a favorite |
| `DELETE` | `/api/favorites/:id` | Yes | Remove a favorite (by favorite UUID) |
| `GET` | `/api/users/me` | Yes | Get user profile |
| `DELETE` | `/api/users/me` | Yes | Delete account |
| `GET` | `/api/subscriptions/status` | Yes | Get subscription & trial status |
| `POST` | `/api/subscriptions/webhook` | No | RevenueCat webhook receiver |
| `GET` | `/api/widget` | Yes | Get widget affirmations |

## Database Schema

| Table | Description |
|-------|-------------|
| `categories` | 10 affirmation categories with emoji and display order |
| `affirmations` | 170+ affirmations with optional background images/colors |
| `user_profiles` | User settings, subscription status, trial dates, selected categories |
| `favorite_affirmations` | User favorites with widget ordering |
| `subscription_events` | RevenueCat webhook audit log |

## Monetization

- **3-day free trial** on first launch
- **Freemium tier**: 3 affirmation views per day
- **Pro subscriptions**: Monthly, yearly, or lifetime via RevenueCat
- Paywall shown when trial expires and user has no active subscription

## Sample Affirmations

> "It's okay to not be okay today"

> "Your anxiety is lying to you"

> "Struggling doesn't mean failing"

> "Rest is productive"

> "Your thoughts aren't facts"

---

Made with care for your daily calm.
