

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."vsk_content" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "audio_src" "text",
    "full_audio_src" "text",
    "image_url" "text",
    "thumbnail_path" "text",
    "duration" integer,
    "episode_number" integer,
    "season" integer DEFAULT 1,
    "slug" "text",
    "published_at" timestamp with time zone,
    "is_published" boolean DEFAULT false,
    "featured" boolean DEFAULT false,
    "category" "text",
    "tags" "text"[],
    "show_notes" "text",
    "transcript" "text",
    "file_size" bigint,
    "meta_title" "text",
    "meta_description" "text",
    "quiz_title" "text",
    "quiz_description" "text",
    "quiz_category" "text",
    "pass_percentage" integer DEFAULT 70,
    "total_questions" integer DEFAULT 0,
    "quiz_is_active" boolean DEFAULT false,
    "series_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "price_cents" integer,
    "stripe_price_id" "text",
    "is_purchasable" boolean DEFAULT true,
    "special_offer_price_cents" integer,
    "special_offer_active" boolean DEFAULT false,
    "special_offer_start_date" timestamp with time zone,
    "special_offer_end_date" timestamp with time zone,
    "special_offer_description" "text",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "deletion_reason" "text",
    "archived_title" "text",
    "archived_description" "text",
    CONSTRAINT "chk_special_offer_dates_logical" CHECK ((("special_offer_start_date" IS NULL) OR ("special_offer_end_date" IS NULL) OR ("special_offer_start_date" < "special_offer_end_date"))),
    CONSTRAINT "chk_special_offer_price_less_than_regular" CHECK ((("special_offer_price_cents" IS NULL) OR ("price_cents" IS NULL) OR ("special_offer_price_cents" < "price_cents")))
);


ALTER TABLE "public"."vsk_content" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vsk_content"."price_cents" IS 'Price in cents for purchasing this CPD content (podcast + quiz + report + certificate)';



COMMENT ON COLUMN "public"."vsk_content"."stripe_price_id" IS 'Stripe Price ID for this content product';



COMMENT ON COLUMN "public"."vsk_content"."is_purchasable" IS 'Whether this content can be purchased (false for free content)';



COMMENT ON COLUMN "public"."vsk_content"."special_offer_price_cents" IS 'Special offer price in cents (must be less than regular price_cents)';



COMMENT ON COLUMN "public"."vsk_content"."special_offer_active" IS 'Whether the special offer is currently active';



COMMENT ON COLUMN "public"."vsk_content"."special_offer_start_date" IS 'When the special offer period starts';



COMMENT ON COLUMN "public"."vsk_content"."special_offer_end_date" IS 'When the special offer period ends';



COMMENT ON COLUMN "public"."vsk_content"."special_offer_description" IS 'Description of the special offer (e.g., "Limited Time Offer", "Black 
  Friday Deal")';



COMMENT ON COLUMN "public"."vsk_content"."deleted_at" IS 'When this content was soft deleted - NULL means not deleted';



COMMENT ON COLUMN "public"."vsk_content"."deleted_by" IS 'Which user deleted this content';



COMMENT ON COLUMN "public"."vsk_content"."deletion_reason" IS 'Optional reason for deletion';



COMMENT ON COLUMN "public"."vsk_content"."archived_title" IS 'Preserved title for historical reference';



COMMENT ON COLUMN "public"."vsk_content"."archived_description" IS 'Preserved description for historical reference';



CREATE OR REPLACE VIEW "public"."vsk_active_content" AS
 SELECT "id",
    "title",
    "description",
    "audio_src",
    "full_audio_src",
    "image_url",
    "thumbnail_path",
    "duration",
    "episode_number",
    "season",
    "slug",
    "published_at",
    "is_published",
    "featured",
    "category",
    "tags",
    "show_notes",
    "transcript",
    "file_size",
    "meta_title",
    "meta_description",
    "quiz_title",
    "quiz_description",
    "quiz_category",
    "pass_percentage",
    "total_questions",
    "quiz_is_active",
    "series_id",
    "created_at",
    "updated_at",
    "price_cents",
    "stripe_price_id",
    "is_purchasable",
    "special_offer_price_cents",
    "special_offer_active",
    "special_offer_start_date",
    "special_offer_end_date",
    "special_offer_description",
    "deleted_at",
    "deleted_by",
    "deletion_reason",
    "archived_title",
    "archived_description"
   FROM "public"."vsk_content"
  WHERE ("deleted_at" IS NULL);


ALTER VIEW "public"."vsk_active_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_articles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text",
    "excerpt" "text",
    "author" "text",
    "image_url" "text",
    "keywords" "text"[],
    "category" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vsk_articles_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."vsk_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_content_purchases" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "stripe_payment_intent_id" "text",
    "stripe_checkout_session_id" "text",
    "amount_paid_cents" integer NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "purchased_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "refunded_at" timestamp with time zone,
    "refund_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vsk_content_purchases_status_check" CHECK (("status" = ANY (ARRAY['completed'::"text", 'refunded'::"text", 'disputed'::"text", 'pending'::"text"])))
);


ALTER TABLE "public"."vsk_content_purchases" OWNER TO "postgres";


COMMENT ON TABLE "public"."vsk_content_purchases" IS 'Tracks individual CPD content purchases - each purchase grants full access to podcast, quiz, report, and certificate';



COMMENT ON COLUMN "public"."vsk_content_purchases"."stripe_payment_intent_id" IS 'Stripe Payment Intent ID for this purchase';



COMMENT ON COLUMN "public"."vsk_content_purchases"."stripe_checkout_session_id" IS 'Stripe Checkout Session ID for tracking the purchase flow';



COMMENT ON COLUMN "public"."vsk_content_purchases"."amount_paid_cents" IS 'Amount paid in cents';



COMMENT ON COLUMN "public"."vsk_content_purchases"."status" IS 'Purchase status: completed (has access), refunded (access revoked), disputed, pending';



CREATE TABLE IF NOT EXISTS "public"."vsk_content_question_answers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "answer_letter" "text" NOT NULL,
    "answer_text" "text" NOT NULL,
    "is_correct" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vsk_content_question_answers_answer_letter_check" CHECK (("answer_letter" = ANY (ARRAY['A'::"text", 'B'::"text", 'C'::"text", 'D'::"text", 'E'::"text"])))
);


ALTER TABLE "public"."vsk_content_question_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_content_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "content_id" "uuid" NOT NULL,
    "question_number" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "explanation" "text",
    "rationale" "text",
    "learning_outcome" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vsk_content_questions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vsk_deleted_content_with_progress" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "title",
    NULL::"text" AS "description",
    NULL::"text" AS "audio_src",
    NULL::"text" AS "full_audio_src",
    NULL::"text" AS "image_url",
    NULL::"text" AS "thumbnail_path",
    NULL::integer AS "duration",
    NULL::integer AS "episode_number",
    NULL::integer AS "season",
    NULL::"text" AS "slug",
    NULL::timestamp with time zone AS "published_at",
    NULL::boolean AS "is_published",
    NULL::boolean AS "featured",
    NULL::"text" AS "category",
    NULL::"text"[] AS "tags",
    NULL::"text" AS "show_notes",
    NULL::"text" AS "transcript",
    NULL::bigint AS "file_size",
    NULL::"text" AS "meta_title",
    NULL::"text" AS "meta_description",
    NULL::"text" AS "quiz_title",
    NULL::"text" AS "quiz_description",
    NULL::"text" AS "quiz_category",
    NULL::integer AS "pass_percentage",
    NULL::integer AS "total_questions",
    NULL::boolean AS "quiz_is_active",
    NULL::"uuid" AS "series_id",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::integer AS "price_cents",
    NULL::"text" AS "stripe_price_id",
    NULL::boolean AS "is_purchasable",
    NULL::integer AS "special_offer_price_cents",
    NULL::boolean AS "special_offer_active",
    NULL::timestamp with time zone AS "special_offer_start_date",
    NULL::timestamp with time zone AS "special_offer_end_date",
    NULL::"text" AS "special_offer_description",
    NULL::timestamp with time zone AS "deleted_at",
    NULL::"uuid" AS "deleted_by",
    NULL::"text" AS "deletion_reason",
    NULL::"text" AS "archived_title",
    NULL::"text" AS "archived_description",
    NULL::bigint AS "total_progress_records",
    NULL::bigint AS "completed_count",
    NULL::bigint AS "listened_count";


ALTER VIEW "public"."vsk_deleted_content_with_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_quiz_completions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "quiz_id" "uuid",
    "podcast_id" "uuid",
    "content_id" "uuid",
    "score" integer DEFAULT 0,
    "max_score" integer DEFAULT 0,
    "percentage" numeric(5,2) DEFAULT 0,
    "time_spent" integer DEFAULT 0,
    "attempts" integer DEFAULT 1,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "answers" "jsonb" DEFAULT '[]'::"jsonb",
    "passed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "quiz_title" "text",
    "content_title" "text"
);


ALTER TABLE "public"."vsk_quiz_completions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vsk_quiz_completions"."quiz_title" IS 'Preserved quiz title for historical reference';



COMMENT ON COLUMN "public"."vsk_quiz_completions"."content_title" IS 'Preserved content title for historical reference';



CREATE TABLE IF NOT EXISTS "public"."vsk_series" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "thumbnail_path" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vsk_series" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_subscription_id" "text" NOT NULL,
    "stripe_customer_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "current_period_start" timestamp with time zone NOT NULL,
    "current_period_end" timestamp with time zone NOT NULL,
    "cancel_at_period_end" boolean DEFAULT false,
    "canceled_at" timestamp with time zone,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vsk_subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'past_due'::"text", 'unpaid'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'trialing'::"text"])))
);


ALTER TABLE "public"."vsk_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."vsk_subscriptions" IS 'User subscriptions for all-access CPD content - active subscription grants access to all purchasable content';



COMMENT ON COLUMN "public"."vsk_subscriptions"."stripe_subscription_id" IS 'Stripe Subscription ID';



COMMENT ON COLUMN "public"."vsk_subscriptions"."stripe_customer_id" IS 'Stripe Customer ID associated with this subscription';



COMMENT ON COLUMN "public"."vsk_subscriptions"."status" IS 'Subscription status from Stripe webhooks';



COMMENT ON COLUMN "public"."vsk_subscriptions"."cancel_at_period_end" IS 'Whether subscription will cancel at the end of current period';



CREATE TABLE IF NOT EXISTS "public"."vsk_user_content_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "has_listened" boolean DEFAULT false,
    "listen_progress_percentage" numeric(5,2) DEFAULT 0,
    "listened_at" timestamp with time zone,
    "quiz_completed" boolean DEFAULT false,
    "quiz_completed_at" timestamp with time zone,
    "report_downloaded" boolean DEFAULT false,
    "report_downloaded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "certificate_downloaded" boolean DEFAULT false,
    "certificate_downloaded_at" timestamp with time zone
);


ALTER TABLE "public"."vsk_user_content_progress" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vsk_user_content_progress"."certificate_downloaded" IS 'Whether the user has downloaded the certificate for this content';



COMMENT ON COLUMN "public"."vsk_user_content_progress"."certificate_downloaded_at" IS 'When the user downloaded the certificate for this content';



CREATE TABLE IF NOT EXISTS "public"."vsk_user_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_quizzes_completed" integer DEFAULT 0,
    "total_quizzes_passed" integer DEFAULT 0,
    "total_score" integer DEFAULT 0,
    "total_max_score" integer DEFAULT 0,
    "average_score" numeric(5,2) DEFAULT 0,
    "total_time_spent" integer DEFAULT 0,
    "completion_rate" numeric(5,2) DEFAULT 0,
    "streak_days" integer DEFAULT 0,
    "last_activity_at" timestamp with time zone,
    "badges" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vsk_user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "avatar" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    "email_verified" boolean DEFAULT false,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "auth_provider" "text",
    "supabase_auth_id" "uuid",
    "avatar_url" "text",
    CONSTRAINT "vsk_users_auth_provider_check" CHECK (("auth_provider" = ANY (ARRAY['email'::"text", 'google'::"text", 'facebook'::"text"]))),
    CONSTRAINT "vsk_users_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'editor'::"text", 'user'::"text", 'viewer'::"text"]))),
    CONSTRAINT "vsk_users_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text", 'pending'::"text"])))
);


ALTER TABLE "public"."vsk_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vsk_valid_keywords" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "keyword" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vsk_valid_keywords" OWNER TO "postgres";


ALTER TABLE ONLY "public"."vsk_articles"
    ADD CONSTRAINT "vsk_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_articles"
    ADD CONSTRAINT "vsk_articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."vsk_content"
    ADD CONSTRAINT "vsk_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_content_purchases"
    ADD CONSTRAINT "vsk_content_purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_content_purchases"
    ADD CONSTRAINT "vsk_content_purchases_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");



ALTER TABLE ONLY "public"."vsk_content_question_answers"
    ADD CONSTRAINT "vsk_content_question_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_content_question_answers"
    ADD CONSTRAINT "vsk_content_question_answers_question_id_answer_letter_key" UNIQUE ("question_id", "answer_letter");



ALTER TABLE ONLY "public"."vsk_content_questions"
    ADD CONSTRAINT "vsk_content_questions_content_id_question_number_key" UNIQUE ("content_id", "question_number");



ALTER TABLE ONLY "public"."vsk_content_questions"
    ADD CONSTRAINT "vsk_content_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_content"
    ADD CONSTRAINT "vsk_content_stripe_price_id_key" UNIQUE ("stripe_price_id");



ALTER TABLE ONLY "public"."vsk_quiz_completions"
    ADD CONSTRAINT "vsk_quiz_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_series"
    ADD CONSTRAINT "vsk_series_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."vsk_series"
    ADD CONSTRAINT "vsk_series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_series"
    ADD CONSTRAINT "vsk_series_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."vsk_subscriptions"
    ADD CONSTRAINT "vsk_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_subscriptions"
    ADD CONSTRAINT "vsk_subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."vsk_user_content_progress"
    ADD CONSTRAINT "vsk_user_content_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_user_content_progress"
    ADD CONSTRAINT "vsk_user_content_progress_user_id_content_id_key" UNIQUE ("user_id", "content_id");



ALTER TABLE ONLY "public"."vsk_user_progress"
    ADD CONSTRAINT "vsk_user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_user_progress"
    ADD CONSTRAINT "vsk_user_progress_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."vsk_users"
    ADD CONSTRAINT "vsk_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."vsk_users"
    ADD CONSTRAINT "vsk_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vsk_valid_keywords"
    ADD CONSTRAINT "vsk_valid_keywords_keyword_key" UNIQUE ("keyword");



ALTER TABLE ONLY "public"."vsk_valid_keywords"
    ADD CONSTRAINT "vsk_valid_keywords_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_vsk_content_deleted_at" ON "public"."vsk_content" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_vsk_content_episode_number" ON "public"."vsk_content" USING "btree" ("episode_number");



CREATE INDEX "idx_vsk_content_not_deleted" ON "public"."vsk_content" USING "btree" ("id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_vsk_content_published" ON "public"."vsk_content" USING "btree" ("is_published", "published_at");



CREATE INDEX "idx_vsk_content_purchases_content_id" ON "public"."vsk_content_purchases" USING "btree" ("content_id");



CREATE INDEX "idx_vsk_content_purchases_status" ON "public"."vsk_content_purchases" USING "btree" ("status");



CREATE INDEX "idx_vsk_content_purchases_stripe_payment_intent" ON "public"."vsk_content_purchases" USING "btree" ("stripe_payment_intent_id") WHERE ("stripe_payment_intent_id" IS NOT NULL);



CREATE INDEX "idx_vsk_content_purchases_user_content" ON "public"."vsk_content_purchases" USING "btree" ("user_id", "content_id");



CREATE UNIQUE INDEX "idx_vsk_content_purchases_user_content_unique" ON "public"."vsk_content_purchases" USING "btree" ("user_id", "content_id") WHERE ("status" = 'completed'::"text");



CREATE INDEX "idx_vsk_content_purchases_user_id" ON "public"."vsk_content_purchases" USING "btree" ("user_id");



CREATE INDEX "idx_vsk_content_questions_content_id" ON "public"."vsk_content_questions" USING "btree" ("content_id");



CREATE INDEX "idx_vsk_content_series_id" ON "public"."vsk_content" USING "btree" ("series_id");



CREATE INDEX "idx_vsk_content_special_offer_active" ON "public"."vsk_content" USING "btree" ("special_offer_active") WHERE ("special_offer_active" = true);



CREATE INDEX "idx_vsk_content_special_offer_dates" ON "public"."vsk_content" USING "btree" ("special_offer_start_date", "special_offer_end_date") WHERE ("special_offer_active" = true);



CREATE INDEX "idx_vsk_content_stripe_price_id" ON "public"."vsk_content" USING "btree" ("stripe_price_id") WHERE ("stripe_price_id" IS NOT NULL);



CREATE INDEX "idx_vsk_quiz_completions_content_id" ON "public"."vsk_quiz_completions" USING "btree" ("content_id");



CREATE INDEX "idx_vsk_quiz_completions_user_id" ON "public"."vsk_quiz_completions" USING "btree" ("user_id");



CREATE INDEX "idx_vsk_series_display_order" ON "public"."vsk_series" USING "btree" ("display_order");



CREATE INDEX "idx_vsk_subscriptions_active" ON "public"."vsk_subscriptions" USING "btree" ("user_id", "status") WHERE ("status" = 'active'::"text");



CREATE UNIQUE INDEX "idx_vsk_subscriptions_one_active_per_user" ON "public"."vsk_subscriptions" USING "btree" ("user_id") WHERE ("status" = ANY (ARRAY['active'::"text", 'trialing'::"text"]));



CREATE INDEX "idx_vsk_subscriptions_status" ON "public"."vsk_subscriptions" USING "btree" ("status");



CREATE INDEX "idx_vsk_subscriptions_stripe_customer_id" ON "public"."vsk_subscriptions" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_vsk_subscriptions_stripe_subscription_id" ON "public"."vsk_subscriptions" USING "btree" ("stripe_subscription_id");



CREATE INDEX "idx_vsk_subscriptions_user_id" ON "public"."vsk_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_vsk_user_progress_user_id" ON "public"."vsk_user_progress" USING "btree" ("user_id");



CREATE INDEX "idx_vsk_users_auth_provider" ON "public"."vsk_users" USING "btree" ("auth_provider");



CREATE INDEX "idx_vsk_users_supabase_auth_id" ON "public"."vsk_users" USING "btree" ("supabase_auth_id");



CREATE UNIQUE INDEX "idx_vsk_users_supabase_auth_id_unique" ON "public"."vsk_users" USING "btree" ("supabase_auth_id") WHERE ("supabase_auth_id" IS NOT NULL);



CREATE OR REPLACE VIEW "public"."vsk_deleted_content_with_progress" AS
 SELECT "c"."id",
    "c"."title",
    "c"."description",
    "c"."audio_src",
    "c"."full_audio_src",
    "c"."image_url",
    "c"."thumbnail_path",
    "c"."duration",
    "c"."episode_number",
    "c"."season",
    "c"."slug",
    "c"."published_at",
    "c"."is_published",
    "c"."featured",
    "c"."category",
    "c"."tags",
    "c"."show_notes",
    "c"."transcript",
    "c"."file_size",
    "c"."meta_title",
    "c"."meta_description",
    "c"."quiz_title",
    "c"."quiz_description",
    "c"."quiz_category",
    "c"."pass_percentage",
    "c"."total_questions",
    "c"."quiz_is_active",
    "c"."series_id",
    "c"."created_at",
    "c"."updated_at",
    "c"."price_cents",
    "c"."stripe_price_id",
    "c"."is_purchasable",
    "c"."special_offer_price_cents",
    "c"."special_offer_active",
    "c"."special_offer_start_date",
    "c"."special_offer_end_date",
    "c"."special_offer_description",
    "c"."deleted_at",
    "c"."deleted_by",
    "c"."deletion_reason",
    "c"."archived_title",
    "c"."archived_description",
    "count"("ucp"."id") AS "total_progress_records",
    "count"(
        CASE
            WHEN "ucp"."quiz_completed" THEN 1
            ELSE NULL::integer
        END) AS "completed_count",
    "count"(
        CASE
            WHEN "ucp"."has_listened" THEN 1
            ELSE NULL::integer
        END) AS "listened_count"
   FROM ("public"."vsk_content" "c"
     LEFT JOIN "public"."vsk_user_content_progress" "ucp" ON (("c"."id" = "ucp"."content_id")))
  WHERE ("c"."deleted_at" IS NOT NULL)
  GROUP BY "c"."id";



CREATE OR REPLACE TRIGGER "update_vsk_articles_updated_at" BEFORE UPDATE ON "public"."vsk_articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_content_questions_updated_at" BEFORE UPDATE ON "public"."vsk_content_questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_content_updated_at" BEFORE UPDATE ON "public"."vsk_content" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_quiz_completions_updated_at" BEFORE UPDATE ON "public"."vsk_quiz_completions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_series_updated_at" BEFORE UPDATE ON "public"."vsk_series" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_user_content_progress_updated_at" BEFORE UPDATE ON "public"."vsk_user_content_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_user_progress_updated_at" BEFORE UPDATE ON "public"."vsk_user_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vsk_users_updated_at" BEFORE UPDATE ON "public"."vsk_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."vsk_content"
    ADD CONSTRAINT "vsk_content_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."vsk_users"("id");



ALTER TABLE ONLY "public"."vsk_content_purchases"
    ADD CONSTRAINT "vsk_content_purchases_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."vsk_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vsk_content_purchases"
    ADD CONSTRAINT "vsk_content_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."vsk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vsk_content_question_answers"
    ADD CONSTRAINT "vsk_content_question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."vsk_content_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vsk_content_questions"
    ADD CONSTRAINT "vsk_content_questions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."vsk_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vsk_content"
    ADD CONSTRAINT "vsk_content_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."vsk_series"("id");



ALTER TABLE ONLY "public"."vsk_quiz_completions"
    ADD CONSTRAINT "vsk_quiz_completions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."vsk_content"("id");



ALTER TABLE ONLY "public"."vsk_quiz_completions"
    ADD CONSTRAINT "vsk_quiz_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."vsk_users"("id");



ALTER TABLE ONLY "public"."vsk_subscriptions"
    ADD CONSTRAINT "vsk_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."vsk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vsk_user_content_progress"
    ADD CONSTRAINT "vsk_user_content_progress_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."vsk_content"("id");



ALTER TABLE ONLY "public"."vsk_user_content_progress"
    ADD CONSTRAINT "vsk_user_content_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."vsk_users"("id");



ALTER TABLE ONLY "public"."vsk_user_progress"
    ADD CONSTRAINT "vsk_user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."vsk_users"("id");



CREATE POLICY "Admins can view all purchases" ON "public"."vsk_content_purchases" USING ((EXISTS ( SELECT 1
   FROM "public"."vsk_users"
  WHERE ((("vsk_users"."id")::"text" = ("auth"."uid"())::"text") AND ("vsk_users"."role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text"]))))));



CREATE POLICY "Admins can view all subscriptions" ON "public"."vsk_subscriptions" USING ((EXISTS ( SELECT 1
   FROM "public"."vsk_users"
  WHERE ((("vsk_users"."id")::"text" = ("auth"."uid"())::"text") AND ("vsk_users"."role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can view their own purchases" ON "public"."vsk_content_purchases" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can view their own subscriptions" ON "public"."vsk_subscriptions" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "allow_all_answers" ON "public"."vsk_content_question_answers" TO "authenticated" USING (true);



CREATE POLICY "allow_all_articles" ON "public"."vsk_articles" TO "authenticated" USING (true);



CREATE POLICY "allow_all_completions" ON "public"."vsk_quiz_completions" TO "authenticated" USING (true);



CREATE POLICY "allow_all_content" ON "public"."vsk_content" TO "authenticated" USING (true);



CREATE POLICY "allow_all_content_progress" ON "public"."vsk_user_content_progress" TO "authenticated" USING (true);



CREATE POLICY "allow_all_keywords" ON "public"."vsk_valid_keywords" TO "authenticated" USING (true);



CREATE POLICY "allow_all_progress" ON "public"."vsk_user_progress" TO "authenticated" USING (true);



CREATE POLICY "allow_all_questions" ON "public"."vsk_content_questions" TO "authenticated" USING (true);



CREATE POLICY "allow_all_series" ON "public"."vsk_series" TO "authenticated" USING (true);



CREATE POLICY "allow_all_users" ON "public"."vsk_users" TO "authenticated" USING (true);



ALTER TABLE "public"."vsk_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_content_purchases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_content_question_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_content_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_quiz_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_series" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_user_content_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vsk_valid_keywords" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."vsk_content" TO "anon";
GRANT ALL ON TABLE "public"."vsk_content" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_content" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_active_content" TO "anon";
GRANT ALL ON TABLE "public"."vsk_active_content" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_active_content" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_articles" TO "anon";
GRANT ALL ON TABLE "public"."vsk_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_articles" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_content_purchases" TO "anon";
GRANT ALL ON TABLE "public"."vsk_content_purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_content_purchases" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_content_question_answers" TO "anon";
GRANT ALL ON TABLE "public"."vsk_content_question_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_content_question_answers" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_content_questions" TO "anon";
GRANT ALL ON TABLE "public"."vsk_content_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_content_questions" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_deleted_content_with_progress" TO "anon";
GRANT ALL ON TABLE "public"."vsk_deleted_content_with_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_deleted_content_with_progress" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_quiz_completions" TO "anon";
GRANT ALL ON TABLE "public"."vsk_quiz_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_quiz_completions" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_series" TO "anon";
GRANT ALL ON TABLE "public"."vsk_series" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_series" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."vsk_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_user_content_progress" TO "anon";
GRANT ALL ON TABLE "public"."vsk_user_content_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_user_content_progress" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_user_progress" TO "anon";
GRANT ALL ON TABLE "public"."vsk_user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_users" TO "anon";
GRANT ALL ON TABLE "public"."vsk_users" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_users" TO "service_role";



GRANT ALL ON TABLE "public"."vsk_valid_keywords" TO "anon";
GRANT ALL ON TABLE "public"."vsk_valid_keywords" TO "authenticated";
GRANT ALL ON TABLE "public"."vsk_valid_keywords" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
