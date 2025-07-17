-- Migration: Create user content progress tracking
-- Date: 2025-07-17
-- Description: Track user progress through podcast episodes (listen, quiz, report, certificate)

-- Create table for tracking user progress on content items
CREATE TABLE IF NOT EXISTS vsk_user_content_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    
    -- Progress tracking
    has_listened BOOLEAN DEFAULT false,
    listen_progress_percentage INTEGER DEFAULT 0 CHECK (listen_progress_percentage >= 0 AND listen_progress_percentage <= 100),
    listened_at TIMESTAMP WITH TIME ZONE,
    
    quiz_completed BOOLEAN DEFAULT false,
    quiz_completed_at TIMESTAMP WITH TIME ZONE,
    
    report_downloaded BOOLEAN DEFAULT false,
    report_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    certificate_downloaded BOOLEAN DEFAULT false,
    certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per content
    UNIQUE(user_id, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_vsk_user_content_progress_user_id ON vsk_user_content_progress(user_id);
CREATE INDEX idx_vsk_user_content_progress_content_id ON vsk_user_content_progress(content_id);
CREATE INDEX idx_vsk_user_content_progress_has_listened ON vsk_user_content_progress(has_listened);
CREATE INDEX idx_vsk_user_content_progress_quiz_completed ON vsk_user_content_progress(quiz_completed);

-- Enable Row Level Security
ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress" ON vsk_user_content_progress
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own progress" ON vsk_user_content_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own progress" ON vsk_user_content_progress
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on progress" ON vsk_user_content_progress
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_vsk_user_content_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_vsk_user_content_progress_updated_at
    BEFORE UPDATE ON vsk_user_content_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_vsk_user_content_progress_updated_at();

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_user_content_progress') THEN
        RAISE NOTICE 'SUCCESS: vsk_user_content_progress table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_user_content_progress table was not created';
    END IF;
END $$;