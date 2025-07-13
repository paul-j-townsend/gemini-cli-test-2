import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing unified content system...');

    // Simply try to access the content table - if it exists, we're good
    // If it doesn't exist, we'll get an error and can advise to create it manually
    const { data: existingContent, error: accessError } = await supabaseAdmin
      .from('vsk_content')
      .select('*')
      .limit(1);

    if (accessError) {
      if (accessError.message.includes('vsk_content')) {
        // Table doesn't exist - this is expected
        return res.status(200).json({
          success: false,
          message: 'Unified content tables do not exist yet.',
          recommendation: 'Please run the SQL migration manually in your Supabase dashboard using the SQL editor.',
          sqlToRun: `
-- Step 1: Create unified content table
CREATE TABLE vsk_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_src TEXT,
    full_audio_src TEXT,
    image_url TEXT,
    thumbnail_path TEXT,
    duration INTEGER,
    episode_number INTEGER NOT NULL DEFAULT 1,
    season INTEGER NOT NULL DEFAULT 1,
    slug TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    category TEXT,
    tags TEXT[],
    show_notes TEXT,
    transcript TEXT,
    file_size INTEGER,
    meta_title TEXT,
    meta_description TEXT,
    quiz_title TEXT,
    quiz_description TEXT,
    quiz_category TEXT,
    pass_percentage INTEGER DEFAULT 70,
    total_questions INTEGER DEFAULT 0,
    quiz_is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create questions table
CREATE TABLE vsk_content_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    rationale TEXT,
    learning_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, question_number)
);

-- Step 3: Create answers table
CREATE TABLE vsk_content_question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, answer_letter)
);

-- Step 4: Enable RLS (optional)
ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY;

-- Step 5: Insert sample data
INSERT INTO vsk_content (
    id, title, description, audio_src, full_audio_src, episode_number, season, slug, 
    is_published, featured, category, published_at,
    quiz_title, quiz_description, quiz_category, pass_percentage, total_questions, quiz_is_active
) VALUES (
    '10000000-0000-0000-0000-000000000001', 
    'Ethics in Veterinary Practice', 
    'An introduction to ethical considerations in veterinary nursing', 
    '/audio/ethics-preview.mp3', 
    '/audio/ethics-full.mp3', 
    1, 1, 
    'ethics-in-veterinary-practice', 
    true, true, 
    'Professional Development', 
    NOW(),
    'Veterinary Ethics Assessment',
    'Test your understanding of ethical principles',
    'ethics',
    70, 2, true
);
          `.trim()
        });
      } else {
        throw accessError;
      }
    }

    // If we get here, the table exists - let's insert some sample data if needed
    if (existingContent && existingContent.length === 0) {
      // Table exists but is empty, let's add sample data
      const { error: insertError } = await supabaseAdmin
        .from('vsk_content')
        .insert([
          {
            id: '10000000-0000-0000-0000-000000000001',
            title: 'Ethics in Veterinary Practice',
            description: 'An introduction to ethical considerations in veterinary nursing',
            audio_src: '/audio/ethics-preview.mp3',
            full_audio_src: '/audio/ethics-full.mp3',
            episode_number: 1,
            season: 1,
            slug: 'ethics-in-veterinary-practice',
            is_published: true,
            featured: true,
            category: 'Professional Development',
            published_at: new Date().toISOString(),
            quiz_title: 'Veterinary Ethics Assessment',
            quiz_description: 'Test your understanding of ethical principles',
            quiz_category: 'ethics',
            pass_percentage: 70,
            total_questions: 2,
            quiz_is_active: true
          }
        ]);

      if (insertError) {
        throw insertError;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Unified content system is working!',
      contentCount: existingContent?.length || 0
    });

  } catch (error) {
    console.error('Migration test error:', error);
    res.status(500).json({ 
      error: 'Failed to test unified content system', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}