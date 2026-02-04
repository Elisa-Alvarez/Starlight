CREATE TABLE "affirmations" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"category_id" text NOT NULL,
	"background_url" text,
	"background_thumbnail_url" text,
	"background_color_primary" text,
	"background_color_secondary" text,
	"display_color" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"emoji" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_affirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"affirmation_id" text NOT NULL,
	"widget_enabled" boolean DEFAULT false NOT NULL,
	"widget_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_affirmations_user_id_affirmation_id_unique" UNIQUE("user_id","affirmation_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"revenuecat_user_id" text,
	"subscription_status" text DEFAULT 'free' NOT NULL,
	"subscription_product_id" text,
	"subscription_expires_at" timestamp with time zone,
	"daily_affirmation_count" integer DEFAULT 0 NOT NULL,
	"last_daily_reset" date DEFAULT CURRENT_DATE NOT NULL,
	"selected_categories" text[] DEFAULT ARRAY['anxiety','winter','energy','self-care','mindfulness','sleep','focus','overthinking','peace','hard-days']::text[] NOT NULL,
	"timezone" text DEFAULT 'UTC',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_revenuecat_user_id_unique" UNIQUE("revenuecat_user_id")
);
--> statement-breakpoint
CREATE TABLE "affirmation_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"affirmation_id" text NOT NULL,
	"source" text NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"app_user_id" text NOT NULL,
	"user_id" text,
	"product_id" text,
	"transaction_id" text,
	"original_transaction_id" text,
	"purchased_at" timestamp with time zone,
	"expiration_at" timestamp with time zone,
	"cancel_reason" text,
	"is_trial_conversion" boolean,
	"price_in_usd" numeric(10, 2),
	"currency" text,
	"raw_payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "affirmations" ADD CONSTRAINT "affirmations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_affirmations" ADD CONSTRAINT "favorite_affirmations_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_affirmations" ADD CONSTRAINT "favorite_affirmations_affirmation_id_affirmations_id_fk" FOREIGN KEY ("affirmation_id") REFERENCES "public"."affirmations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affirmation_views" ADD CONSTRAINT "affirmation_views_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affirmation_views" ADD CONSTRAINT "affirmation_views_affirmation_id_affirmations_id_fk" FOREIGN KEY ("affirmation_id") REFERENCES "public"."affirmations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE set null ON UPDATE no action;