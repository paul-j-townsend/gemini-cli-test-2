--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter) FROM stdin;
f6a48bf8-5708-4f22-806e-7cb6e5c4e482	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-08-08 13:03:25	2025-08-08 13:03:25	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	63	gen_rpc
\.


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
ae7c402c-1701-4af6-a41b-363c8ab2c117	postgres_cdc_rls	{"region": "us-east-1", "db_host": "0P5M+FAVvQ2ICTSJ4bRYibcXEGQrTF6X9nSkcJPpKD0=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-08-08 13:03:25	2025-08-08 13:03:25
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-07-29 20:34:33
20220329161857	2025-07-29 20:34:33
20220410212326	2025-07-29 20:34:33
20220506102948	2025-07-29 20:34:33
20220527210857	2025-07-29 20:34:33
20220815211129	2025-07-29 20:34:33
20220815215024	2025-07-29 20:34:33
20220818141501	2025-07-29 20:34:33
20221018173709	2025-07-29 20:34:33
20221102172703	2025-07-29 20:34:33
20221223010058	2025-07-29 20:34:33
20230110180046	2025-07-29 20:34:33
20230810220907	2025-07-29 20:34:33
20230810220924	2025-07-29 20:34:33
20231024094642	2025-07-29 20:34:33
20240306114423	2025-07-29 20:34:33
20240418082835	2025-07-29 20:34:33
20240625211759	2025-07-29 20:34:33
20240704172020	2025-07-29 20:34:33
20240902173232	2025-07-29 20:34:33
20241106103258	2025-07-29 20:34:33
20250424203323	2025-07-29 20:34:33
20250613072131	2025-07-29 20:34:33
20250711044927	2025-07-29 20:34:33
\.


--
-- Data for Name: vsk_articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_articles (id, title, slug, content, excerpt, author, image_url, keywords, category, status, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vsk_series; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_series (id, name, slug, description, thumbnail_path, display_order, is_active, created_at, updated_at) FROM stdin;
981e7486-1a15-45c0-8b26-675403f32df4	test 1	test-1	\N	\N	1	t	2025-08-08 14:25:11.756672+00	2025-08-08 14:25:11.756672+00
\.


--
-- Data for Name: vsk_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_users (id, email, name, role, status, avatar, created_at, updated_at, last_login_at, email_verified, preferences, auth_provider, supabase_auth_id, avatar_url) FROM stdin;
fed2a63e-196d-43ff-9ebc-674db34e72a7	test@example.com	Test User	user	active	\N	2025-08-08 14:21:41.699297+00	2025-08-08 14:21:41.699297+00	\N	f	{}	\N	\N	\N
\.


--
-- Data for Name: vsk_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_content (id, title, description, audio_src, full_audio_src, image_url, thumbnail_path, duration, episode_number, season, slug, published_at, is_published, featured, category, tags, show_notes, transcript, file_size, meta_title, meta_description, quiz_title, quiz_description, quiz_category, pass_percentage, total_questions, quiz_is_active, series_id, created_at, updated_at, price_cents, stripe_price_id, is_purchasable, special_offer_price_cents, special_offer_active, special_offer_start_date, special_offer_end_date, special_offer_description, deleted_at, deleted_by, deletion_reason, archived_title, archived_description) FROM stdin;
c387d722-3303-48c8-808b-b05fb02e70ce	Episode 1 - New Content	A comprehensive educational episode covering important veterinary nursing concepts and best practices.	http://127.0.0.1:54321/storage/v1/object/public/audio/episodes/1754663033271-walkalone.mp3	http://127.0.0.1:54321/storage/v1/object/public/audio/episodes/1754663038374-walkalone.mp3	http://127.0.0.1:54321/storage/v1/object/public/images/thumbnails/1754663052009-zoonoses-s1e2.png	thumbnails/1754663052009-zoonoses-s1e2.png	3600	1	1	episode-1-new-content	2025-08-08 14:23:00+00	t	f	Clinical Practice	\N	In this episode, we explore key concepts and practical applications relevant to modern veterinary nursing practice.	\N	\N	Episode 1 - VetSidekick CPD	Professional development content for veterinary nurses focusing on clinical skills and knowledge enhancement.	Episode 1 Assessment	Test your understanding of the key concepts covered in this episode.	general	70	1	t	981e7486-1a15-45c0-8b26-675403f32df4	2025-08-08 14:24:22.165225+00	2025-08-08 14:25:30.840317+00	999	\N	t	0	f	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: vsk_content_purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_content_purchases (id, user_id, content_id, stripe_payment_intent_id, stripe_checkout_session_id, amount_paid_cents, currency, purchased_at, status, refunded_at, refund_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vsk_content_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_content_questions (id, content_id, question_number, question_text, explanation, rationale, learning_outcome, created_at, updated_at) FROM stdin;
36459a61-1848-4400-b5cc-3b16a59f96bc	c387d722-3303-48c8-808b-b05fb02e70ce	1	Which of the following best describes the key concept covered in question 1?	This question assesses understanding of fundamental veterinary nursing principles.	Understanding this concept is essential for safe and effective veterinary nursing practice. The correct answer demonstrates knowledge of evidence-based protocols and clinical reasoning.	Analyze and apply key veterinary nursing concepts in clinical practice scenarios	2025-08-08 14:25:30.867956+00	2025-08-08 14:25:30.867956+00
\.


--
-- Data for Name: vsk_content_question_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_content_question_answers (id, question_id, answer_letter, answer_text, is_correct, created_at) FROM stdin;
90d36bfd-ec0f-4d62-a076-4a11d0f6d261	36459a61-1848-4400-b5cc-3b16a59f96bc	A	First answer option - replace with correct content	t	2025-08-08 14:25:30.878204+00
3685848a-c0ae-4cd1-b579-261c89021745	36459a61-1848-4400-b5cc-3b16a59f96bc	B	Second answer option - replace with incorrect content	f	2025-08-08 14:25:30.878204+00
8c1e2520-62cc-4ca6-bc4a-5396ee5f6e71	36459a61-1848-4400-b5cc-3b16a59f96bc	C	Third answer option - replace with incorrect content	f	2025-08-08 14:25:30.878204+00
0dc2916d-367c-4381-93b6-815fe064f44e	36459a61-1848-4400-b5cc-3b16a59f96bc	D	Fourth answer option - replace with incorrect content	f	2025-08-08 14:25:30.878204+00
\.


--
-- Data for Name: vsk_quiz_completions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_quiz_completions (id, user_id, quiz_id, podcast_id, content_id, score, max_score, percentage, time_spent, attempts, completed_at, answers, passed, created_at, updated_at, quiz_title, content_title) FROM stdin;
\.


--
-- Data for Name: vsk_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_subscriptions (id, user_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_start, trial_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vsk_user_content_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_user_content_progress (id, user_id, content_id, has_listened, listen_progress_percentage, listened_at, quiz_completed, quiz_completed_at, report_downloaded, report_downloaded_at, created_at, updated_at, certificate_downloaded, certificate_downloaded_at) FROM stdin;
\.


--
-- Data for Name: vsk_user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_user_progress (id, user_id, total_quizzes_completed, total_quizzes_passed, total_score, total_max_score, average_score, total_time_spent, completion_rate, streak_days, last_activity_at, badges, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vsk_valid_keywords; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vsk_valid_keywords (id, keyword, description, category, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250719202941	{"-- Comprehensive VetSidekick Database Schema\n-- This migration creates all core tables needed for the application\n\n-- Enable UUID extension\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","-- Users table\nCREATE TABLE vsk_users (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    email TEXT UNIQUE NOT NULL,\n    name TEXT NOT NULL,\n    role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'editor', 'user', 'viewer')),\n    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),\n    avatar TEXT,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    last_login_at TIMESTAMP WITH TIME ZONE,\n    email_verified BOOLEAN DEFAULT false,\n    preferences JSONB DEFAULT '{}'::jsonb\n)","-- Series table for organizing content\nCREATE TABLE vsk_series (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    name TEXT NOT NULL UNIQUE,\n    slug TEXT NOT NULL UNIQUE,\n    description TEXT,\n    thumbnail_path TEXT,\n    display_order INTEGER DEFAULT 0,\n    is_active BOOLEAN DEFAULT true,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Unified content table (podcasts + quizzes)\nCREATE TABLE vsk_content (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    -- Podcast fields\n    title TEXT NOT NULL,\n    description TEXT,\n    audio_src TEXT,\n    full_audio_src TEXT,\n    image_url TEXT,\n    thumbnail_path TEXT,\n    duration INTEGER,\n    episode_number INTEGER,\n    season INTEGER DEFAULT 1,\n    slug TEXT,\n    published_at TIMESTAMP WITH TIME ZONE,\n    is_published BOOLEAN DEFAULT false,\n    featured BOOLEAN DEFAULT false,\n    category TEXT,\n    tags TEXT[],\n    show_notes TEXT,\n    transcript TEXT,\n    file_size BIGINT,\n    meta_title TEXT,\n    meta_description TEXT,\n    -- Quiz fields\n    quiz_title TEXT,\n    quiz_description TEXT,\n    quiz_category TEXT,\n    pass_percentage INTEGER DEFAULT 70,\n    total_questions INTEGER DEFAULT 0,\n    quiz_is_active BOOLEAN DEFAULT false,\n    -- Series relationship\n    series_id UUID REFERENCES vsk_series(id),\n    -- Metadata\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Content questions for quizzes\nCREATE TABLE vsk_content_questions (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,\n    question_number INTEGER NOT NULL,\n    question_text TEXT NOT NULL,\n    explanation TEXT,\n    rationale TEXT,\n    learning_outcome TEXT,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    UNIQUE(content_id, question_number)\n)","-- Multiple choice answers for questions\nCREATE TABLE vsk_content_question_answers (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,\n    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),\n    answer_text TEXT NOT NULL,\n    is_correct BOOLEAN DEFAULT false,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    UNIQUE(question_id, answer_letter)\n)","-- Quiz completion tracking\nCREATE TABLE vsk_quiz_completions (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    user_id UUID NOT NULL REFERENCES vsk_users(id),\n    quiz_id UUID, -- Legacy reference, kept for compatibility\n    podcast_id UUID, -- Legacy reference\n    content_id UUID REFERENCES vsk_content(id), -- New reference to unified content\n    score INTEGER DEFAULT 0,\n    max_score INTEGER DEFAULT 0,\n    percentage DECIMAL(5,2) DEFAULT 0,\n    time_spent INTEGER DEFAULT 0, -- in seconds\n    attempts INTEGER DEFAULT 1,\n    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    answers JSONB DEFAULT '[]'::jsonb,\n    passed BOOLEAN DEFAULT false,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- User progress aggregation\nCREATE TABLE vsk_user_progress (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    user_id UUID UNIQUE NOT NULL REFERENCES vsk_users(id),\n    total_quizzes_completed INTEGER DEFAULT 0,\n    total_quizzes_passed INTEGER DEFAULT 0,\n    total_score INTEGER DEFAULT 0,\n    total_max_score INTEGER DEFAULT 0,\n    average_score DECIMAL(5,2) DEFAULT 0,\n    total_time_spent INTEGER DEFAULT 0,\n    completion_rate DECIMAL(5,2) DEFAULT 0,\n    streak_days INTEGER DEFAULT 0,\n    last_activity_at TIMESTAMP WITH TIME ZONE,\n    badges JSONB DEFAULT '[]'::jsonb,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Content-specific user progress\nCREATE TABLE vsk_user_content_progress (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    user_id UUID NOT NULL REFERENCES vsk_users(id),\n    content_id UUID NOT NULL REFERENCES vsk_content(id),\n    has_listened BOOLEAN DEFAULT false,\n    listen_progress_percentage DECIMAL(5,2) DEFAULT 0,\n    listened_at TIMESTAMP WITH TIME ZONE,\n    quiz_completed BOOLEAN DEFAULT false,\n    quiz_completed_at TIMESTAMP WITH TIME ZONE,\n    report_downloaded BOOLEAN DEFAULT false,\n    report_downloaded_at TIMESTAMP WITH TIME ZONE,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    UNIQUE(user_id, content_id)\n)","-- Articles table\nCREATE TABLE vsk_articles (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    title TEXT NOT NULL,\n    slug TEXT UNIQUE NOT NULL,\n    content TEXT,\n    excerpt TEXT,\n    author TEXT,\n    image_url TEXT,\n    keywords TEXT[],\n    category TEXT,\n    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),\n    published_at TIMESTAMP WITH TIME ZONE,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Valid keywords for content tagging\nCREATE TABLE vsk_valid_keywords (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    keyword TEXT UNIQUE NOT NULL,\n    description TEXT,\n    category TEXT,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Create indexes for performance\nCREATE INDEX idx_vsk_content_series_id ON vsk_content(series_id)","CREATE INDEX idx_vsk_content_published ON vsk_content(is_published, published_at)","CREATE INDEX idx_vsk_content_episode_number ON vsk_content(episode_number)","CREATE INDEX idx_vsk_content_questions_content_id ON vsk_content_questions(content_id)","CREATE INDEX idx_vsk_quiz_completions_user_id ON vsk_quiz_completions(user_id)","CREATE INDEX idx_vsk_quiz_completions_content_id ON vsk_quiz_completions(content_id)","CREATE INDEX idx_vsk_user_progress_user_id ON vsk_user_progress(user_id)","CREATE INDEX idx_vsk_series_display_order ON vsk_series(display_order)","-- Enable Row Level Security\nALTER TABLE vsk_users ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_series ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_quiz_completions ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_user_progress ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_articles ENABLE ROW LEVEL SECURITY","ALTER TABLE vsk_valid_keywords ENABLE ROW LEVEL SECURITY","-- Basic RLS policies (allow all for development)\nCREATE POLICY \\"allow_all_users\\" ON vsk_users FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_series\\" ON vsk_series FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_content\\" ON vsk_content FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_questions\\" ON vsk_content_questions FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_answers\\" ON vsk_content_question_answers FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_completions\\" ON vsk_quiz_completions FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_progress\\" ON vsk_user_progress FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_content_progress\\" ON vsk_user_content_progress FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_articles\\" ON vsk_articles FOR ALL TO authenticated USING (true)","CREATE POLICY \\"allow_all_keywords\\" ON vsk_valid_keywords FOR ALL TO authenticated USING (true)","-- Add updated_at triggers\nCREATE OR REPLACE FUNCTION update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n    NEW.updated_at = NOW();\n    RETURN NEW;\nEND;\n$$ language 'plpgsql'","CREATE TRIGGER update_vsk_users_updated_at BEFORE UPDATE ON vsk_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_series_updated_at BEFORE UPDATE ON vsk_series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_content_updated_at BEFORE UPDATE ON vsk_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_content_questions_updated_at BEFORE UPDATE ON vsk_content_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_quiz_completions_updated_at BEFORE UPDATE ON vsk_quiz_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_user_progress_updated_at BEFORE UPDATE ON vsk_user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_user_content_progress_updated_at BEFORE UPDATE ON vsk_user_content_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_vsk_articles_updated_at BEFORE UPDATE ON vsk_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Insert sample data\n\n-- Sample users (including the default user from UserContext)\nINSERT INTO vsk_users (id, email, name, role, status, email_verified) VALUES\n    ('fed2a63e-196d-43ff-9ebc-674db34e72a7', 'super.admin@vetsidekick.com', 'Super Admin', 'super_admin', 'active', true),\n    ('12345678-1234-1234-1234-123456789012', 'admin@vetsidekick.com', 'Admin User', 'admin', 'active', true),\n    ('12345678-1234-1234-1234-123456789013', 'editor@vetsidekick.com', 'Content Editor', 'editor', 'active', true),\n    ('12345678-1234-1234-1234-123456789014', 'user@vetsidekick.com', 'Regular User', 'user', 'active', true)","-- Placeholder series\nINSERT INTO vsk_series (name, slug, description, display_order, is_active) VALUES\n    ('Series One Holder', 'series-one-holder', 'Placeholder for first series - ready for content assignment', 1, true),\n    ('Series Two Holder', 'series-two-holder', 'Placeholder for second series - ready for content assignment', 2, true),\n    ('Series Three Holder', 'series-three-holder', 'Placeholder for third series - ready for content assignment', 3, true)","-- Sample content (episodes)\nINSERT INTO vsk_content (\n    title, description, episode_number, season, duration, \n    quiz_title, quiz_description, total_questions, quiz_is_active,\n    is_published, published_at, thumbnail_path\n) VALUES\n    ('Episode 1 - New Content', 'A comprehensive educational episode covering important veterinary nursing concepts and best practices.', 1, 1, 3600,\n     'Episode 1 Assessment', 'Test your knowledge from Episode 1', 3, true,\n     true, '2025-07-18T00:00:00Z', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'),\n    \n    ('Episode 2 - New Content', 'A comprehensive educational episode covering important veterinary nursing concepts and best practices.', 2, 1, 1800,\n     'Episode 2 Assessment', 'Test your knowledge from Episode 2', 2, true,\n     true, '2025-07-18T00:00:00Z', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'),\n     \n    ('Episode 3 - New Content', 'A comprehensive educational episode covering important veterinary nursing concepts and best practices.', 3, 1, 1800,\n     'Episode 3 Assessment', 'Test your knowledge from Episode 3', 2, true,\n     true, '2025-07-18T00:00:00Z', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center')","-- Sample questions for Episode 1\nINSERT INTO vsk_content_questions (content_id, question_number, question_text, explanation, rationale, learning_outcome)\nSELECT \n    c.id,\n    1,\n    'Which of the following best describes the key concept covered in this episode?',\n    'This question assesses understanding of fundamental veterinary nursing principles.',\n    'Understanding this concept is essential for safe and effective veterinary nursing practice.',\n    'Analyze and apply key veterinary nursing concepts in clinical practice scenarios'\nFROM vsk_content c WHERE c.title = 'Episode 1 - New Content'","-- Add answers for the first question\nINSERT INTO vsk_content_question_answers (question_id, answer_letter, answer_text, is_correct)\nSELECT \n    q.id,\n    'A',\n    'Correct answer demonstrating proper understanding',\n    true\nFROM vsk_content_questions q \nJOIN vsk_content c ON q.content_id = c.id \nWHERE c.title = 'Episode 1 - New Content' AND q.question_number = 1","INSERT INTO vsk_content_question_answers (question_id, answer_letter, answer_text, is_correct)\nSELECT \n    q.id,\n    unnest(ARRAY['B', 'C', 'D']),\n    unnest(ARRAY['Incorrect option B', 'Incorrect option C', 'Incorrect option D']),\n    false\nFROM vsk_content_questions q \nJOIN vsk_content c ON q.content_id = c.id \nWHERE c.title = 'Episode 1 - New Content' AND q.question_number = 1"}	comprehensive_vetsidekick_schema
20250725122500	{"-- Add missing certificate columns to vsk_user_content_progress table\n-- This migration adds the certificate_downloaded and certificate_downloaded_at columns\n\nALTER TABLE vsk_user_content_progress \nADD COLUMN IF NOT EXISTS certificate_downloaded BOOLEAN DEFAULT false,\nADD COLUMN IF NOT EXISTS certificate_downloaded_at TIMESTAMP WITH TIME ZONE","-- Add comment to document the change\nCOMMENT ON COLUMN vsk_user_content_progress.certificate_downloaded IS 'Whether the user has downloaded the certificate for this content'","COMMENT ON COLUMN vsk_user_content_progress.certificate_downloaded_at IS 'When the user downloaded the certificate for this content'"}	add_certificate_columns
20250727165824	{"-- Add OAuth-related fields to the vsk_users table\nALTER TABLE vsk_users \nADD COLUMN IF NOT EXISTS auth_provider text CHECK (auth_provider IN ('email', 'google', 'facebook')),\nADD COLUMN IF NOT EXISTS supabase_auth_id uuid,\nADD COLUMN IF NOT EXISTS avatar_url text","-- Add index for faster lookups by Supabase auth ID\nCREATE INDEX IF NOT EXISTS idx_vsk_users_supabase_auth_id ON vsk_users(supabase_auth_id)","-- Add index for auth provider lookups\nCREATE INDEX IF NOT EXISTS idx_vsk_users_auth_provider ON vsk_users(auth_provider)","-- Add unique constraint to prevent duplicate Supabase auth IDs\nCREATE UNIQUE INDEX IF NOT EXISTS idx_vsk_users_supabase_auth_id_unique \nON vsk_users(supabase_auth_id) \nWHERE supabase_auth_id IS NOT NULL","-- Update existing users to have email as their auth provider by default\nUPDATE vsk_users \nSET auth_provider = 'email' \nWHERE auth_provider IS NULL"}	add_oauth_fields_to_users
20250729120000	{"-- Add payment-related columns to existing vsk_content table\n-- This migration is ADDITIVE ONLY - no data will be deleted or modified\n\n-- Add payment columns to vsk_content table\nALTER TABLE vsk_content \nADD COLUMN price_cents INTEGER,\nADD COLUMN stripe_price_id TEXT UNIQUE,\nADD COLUMN is_purchasable BOOLEAN DEFAULT true","-- Add comment for documentation\nCOMMENT ON COLUMN vsk_content.price_cents IS 'Price in cents for purchasing this CPD content (podcast + quiz + report + certificate)'","COMMENT ON COLUMN vsk_content.stripe_price_id IS 'Stripe Price ID for this content product'","COMMENT ON COLUMN vsk_content.is_purchasable IS 'Whether this content can be purchased (false for free content)'","-- Create index on stripe_price_id for faster lookups\nCREATE INDEX IF NOT EXISTS idx_vsk_content_stripe_price_id ON vsk_content(stripe_price_id) WHERE stripe_price_id IS NOT NULL"}	add_payment_columns_to_content
20250729120001	{"-- Create table for tracking individual CPD content purchases\n-- Each purchase grants access to complete CPD package (podcast + quiz + report + certificate)\n\nCREATE TABLE vsk_content_purchases (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    user_id UUID NOT NULL REFERENCES vsk_users(id) ON DELETE CASCADE,\n    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,\n    stripe_payment_intent_id TEXT UNIQUE,\n    stripe_checkout_session_id TEXT,\n    amount_paid_cents INTEGER NOT NULL,\n    currency VARCHAR(3) NOT NULL DEFAULT 'USD',\n    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'disputed', 'pending')),\n    refunded_at TIMESTAMP WITH TIME ZONE,\n    refund_reason TEXT,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Add comments for documentation\nCOMMENT ON TABLE vsk_content_purchases IS 'Tracks individual CPD content purchases - each purchase grants full access to podcast, quiz, report, and certificate'","COMMENT ON COLUMN vsk_content_purchases.stripe_payment_intent_id IS 'Stripe Payment Intent ID for this purchase'","COMMENT ON COLUMN vsk_content_purchases.stripe_checkout_session_id IS 'Stripe Checkout Session ID for tracking the purchase flow'","COMMENT ON COLUMN vsk_content_purchases.amount_paid_cents IS 'Amount paid in cents'","COMMENT ON COLUMN vsk_content_purchases.status IS 'Purchase status: completed (has access), refunded (access revoked), disputed, pending'","-- Create indexes for performance\nCREATE INDEX idx_vsk_content_purchases_user_id ON vsk_content_purchases(user_id)","CREATE INDEX idx_vsk_content_purchases_content_id ON vsk_content_purchases(content_id)","CREATE INDEX idx_vsk_content_purchases_user_content ON vsk_content_purchases(user_id, content_id)","CREATE INDEX idx_vsk_content_purchases_stripe_payment_intent ON vsk_content_purchases(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL","CREATE INDEX idx_vsk_content_purchases_status ON vsk_content_purchases(status)","-- Ensure one purchase record per user per content item\nCREATE UNIQUE INDEX idx_vsk_content_purchases_user_content_unique ON vsk_content_purchases(user_id, content_id) WHERE status = 'completed'","-- Enable Row Level Security\nALTER TABLE vsk_content_purchases ENABLE ROW LEVEL SECURITY","-- RLS Policy: Users can only see their own purchases\nCREATE POLICY \\"Users can view their own purchases\\" ON vsk_content_purchases\n    FOR SELECT USING (auth.uid()::text = user_id::text)","-- RLS Policy: Admins can view all purchases\nCREATE POLICY \\"Admins can view all purchases\\" ON vsk_content_purchases\n    FOR ALL USING (\n        EXISTS (\n            SELECT 1 FROM vsk_users \n            WHERE id::text = auth.uid()::text \n            AND role IN ('super_admin', 'admin')\n        )\n    )"}	create_content_purchases_table
20250729120002	{"-- Create table for tracking user subscriptions to all-access CPD content\n-- Subscription grants access to all CPD content without individual purchases\n\nCREATE TABLE vsk_subscriptions (\n    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n    user_id UUID NOT NULL REFERENCES vsk_users(id) ON DELETE CASCADE,\n    stripe_subscription_id TEXT UNIQUE NOT NULL,\n    stripe_customer_id TEXT NOT NULL,\n    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing')),\n    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,\n    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,\n    cancel_at_period_end BOOLEAN DEFAULT false,\n    canceled_at TIMESTAMP WITH TIME ZONE,\n    trial_start TIMESTAMP WITH TIME ZONE,\n    trial_end TIMESTAMP WITH TIME ZONE,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)","-- Add comments for documentation\nCOMMENT ON TABLE vsk_subscriptions IS 'User subscriptions for all-access CPD content - active subscription grants access to all purchasable content'","COMMENT ON COLUMN vsk_subscriptions.stripe_subscription_id IS 'Stripe Subscription ID'","COMMENT ON COLUMN vsk_subscriptions.stripe_customer_id IS 'Stripe Customer ID associated with this subscription'","COMMENT ON COLUMN vsk_subscriptions.status IS 'Subscription status from Stripe webhooks'","COMMENT ON COLUMN vsk_subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at the end of current period'","-- Create indexes for performance\nCREATE INDEX idx_vsk_subscriptions_user_id ON vsk_subscriptions(user_id)","CREATE INDEX idx_vsk_subscriptions_stripe_subscription_id ON vsk_subscriptions(stripe_subscription_id)","CREATE INDEX idx_vsk_subscriptions_stripe_customer_id ON vsk_subscriptions(stripe_customer_id)","CREATE INDEX idx_vsk_subscriptions_status ON vsk_subscriptions(status)","CREATE INDEX idx_vsk_subscriptions_active ON vsk_subscriptions(user_id, status) WHERE status = 'active'","-- Users should only have one active subscription at a time\nCREATE UNIQUE INDEX idx_vsk_subscriptions_one_active_per_user ON vsk_subscriptions(user_id) \nWHERE status IN ('active', 'trialing')","-- Enable Row Level Security\nALTER TABLE vsk_subscriptions ENABLE ROW LEVEL SECURITY","-- RLS Policy: Users can only see their own subscriptions\nCREATE POLICY \\"Users can view their own subscriptions\\" ON vsk_subscriptions\n    FOR SELECT USING (auth.uid()::text = user_id::text)","-- RLS Policy: Admins can view all subscriptions\nCREATE POLICY \\"Admins can view all subscriptions\\" ON vsk_subscriptions\n    FOR ALL USING (\n        EXISTS (\n            SELECT 1 FROM vsk_users \n            WHERE id::text = auth.uid()::text \n            AND role IN ('super_admin', 'admin')\n        )\n    )"}	create_subscriptions_table
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

