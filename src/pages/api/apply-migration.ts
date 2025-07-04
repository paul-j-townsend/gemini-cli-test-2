import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if columns already exist by testing a simple query
    try {
      await supabaseAdmin
        .from('vsk_podcast_episodes')
        .select('published')
        .limit(1);
      
      return res.status(200).json({ message: 'Migration already applied - columns exist' });
    } catch (error: any) {
      if (!error.message.includes('column "published" does not exist')) {
        throw error;
      }
      // Column doesn't exist, proceed with migration info
    }

    return res.status(200).json({ 
      message: 'Migration needs to be applied manually in Supabase dashboard',
      instructions: [
        'Open your Supabase dashboard',
        'Go to SQL Editor',
        'Run the migration SQL from supabase/migrations/013_enhance_podcast_episodes.sql',
        'This will add the new columns: episode_number, season, duration, slug, published, featured, category, tags, show_notes, transcript, file_size, meta_title, meta_description'
      ],
      sql_file: '/supabase/migrations/013_enhance_podcast_episodes.sql'
    });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}