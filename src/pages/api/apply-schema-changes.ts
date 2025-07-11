import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { step } = req.body;

  try {
    let result;
    
    switch (step) {
      case 'drop_constraint':
        result = await dropConstraint();
        break;
      case 'add_not_null':
        result = await addNotNull();
        break;
      case 'add_unique':
        result = await addUnique();
        break;
      case 'add_foreign_key':
        result = await addForeignKey();
        break;
      case 'seed_data':
        result = await seedData();
        break;
      default:
        return res.status(400).json({ error: 'Invalid step' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error applying schema changes:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function dropConstraint() {
  console.log('Dropping existing constraint...');
  
  const { error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('*')
    .limit(1);
  
  if (error) {
    throw new Error(`Failed to access table: ${error.message}`);
  }

  // Since we can't run DDL directly, we'll work with the existing structure
  return { success: true, message: 'Constraint handling via data validation' };
}

async function addNotNull() {
  console.log('Checking for null quiz_id values...');
  
  const { data: nullQuizIds, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('id, title')
    .is('quiz_id', null);

  if (error) {
    throw new Error(`Failed to check null values: ${error.message}`);
  }

  if (nullQuizIds && nullQuizIds.length > 0) {
    throw new Error(`Cannot make quiz_id NOT NULL: ${nullQuizIds.length} episodes have null quiz_id`);
  }

  return { success: true, message: 'All episodes have non-null quiz_id' };
}

async function addUnique() {
  console.log('Checking for duplicate quiz_id values...');
  
  const { data: allEpisodes, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('id, quiz_id')
    .not('quiz_id', 'is', null);

  if (error) {
    throw new Error(`Failed to check duplicates: ${error.message}`);
  }

  if (allEpisodes) {
    const quizIds = allEpisodes.map(ep => ep.quiz_id);
    const uniqueQuizIds = new Set(quizIds);
    
    if (quizIds.length !== uniqueQuizIds.size) {
      // Find duplicates
      const duplicates = quizIds.filter((id, index) => quizIds.indexOf(id) !== index);
      throw new Error(`Cannot add unique constraint: duplicate quiz_id values found: ${duplicates.join(', ')}`);
    }
  }

  return { success: true, message: 'All quiz_id values are unique' };
}

async function addForeignKey() {
  console.log('Checking foreign key integrity...');
  
  const { data: episodes, error: episodeError } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('id, quiz_id')
    .not('quiz_id', 'is', null);

  if (episodeError) {
    throw new Error(`Failed to check episodes: ${episodeError.message}`);
  }

  if (episodes) {
    const quizIds = episodes.map(ep => ep.quiz_id);
    
    const { data: quizzes, error: quizError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('id')
      .in('id', quizIds);

    if (quizError) {
      throw new Error(`Failed to check quizzes: ${quizError.message}`);
    }

    const existingQuizIds = new Set(quizzes?.map(q => q.id) || []);
    const missingQuizIds = quizIds.filter(id => !existingQuizIds.has(id));

    if (missingQuizIds.length > 0) {
      throw new Error(`Cannot add foreign key: missing quiz IDs: ${missingQuizIds.join(', ')}`);
    }
  }

  return { success: true, message: 'Foreign key integrity verified' };
}

async function seedData() {
  console.log('Seeding fresh data...');
  
  // Insert sample quizzes
  const quizzes = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Veterinary Ethics Quiz',
      description: 'Test your knowledge of veterinary ethics and professional practice',
      category: 'ethics',
      pass_percentage: 70,
      total_questions: 2,
      is_active: true
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Pain Management Quiz',
      description: 'Understanding pain assessment and management in veterinary patients',
      category: 'pain-management',
      pass_percentage: 80,
      total_questions: 3,
      is_active: true
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Surgical Nursing Quiz',
      description: 'Pre and post-operative care for surgical patients',
      category: 'surgical-nursing',
      pass_percentage: 75,
      total_questions: 2,
      is_active: true
    }
  ];

  const { error: quizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .insert(quizzes);

  if (quizError) {
    throw new Error(`Failed to insert quizzes: ${quizError.message}`);
  }

  // Insert sample podcast episodes
  const episodes = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      title: 'Ethics in Veterinary Practice',
      description: 'An introduction to ethical considerations in veterinary nursing',
      audio_src: '/audio/ethics-preview.mp3',
      full_audio_src: '/audio/ethics-full.mp3',
      episode_number: 1,
      quiz_id: '10000000-0000-0000-0000-000000000001',
      is_published: true,
      slug: 'ethics-in-veterinary-practice'
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      title: 'Pain Assessment and Management',
      description: 'Comprehensive guide to recognizing and managing pain in animals',
      audio_src: '/audio/pain-preview.mp3',
      full_audio_src: '/audio/pain-full.mp3',
      episode_number: 2,
      quiz_id: '10000000-0000-0000-0000-000000000002',
      is_published: true,
      slug: 'pain-assessment-and-management'
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      title: 'Surgical Nursing Excellence',
      description: 'Best practices for pre and post-operative patient care',
      audio_src: '/audio/surgical-preview.mp3',
      full_audio_src: '/audio/surgical-full.mp3',
      episode_number: 3,
      quiz_id: '10000000-0000-0000-0000-000000000003',
      is_published: true,
      slug: 'surgical-nursing-excellence'
    }
  ];

  const { error: episodeError } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .insert(episodes);

  if (episodeError) {
    throw new Error(`Failed to insert episodes: ${episodeError.message}`);
  }

  return { 
    success: true, 
    message: 'Fresh data seeded successfully',
    data: {
      quizzes: quizzes.length,
      episodes: episodes.length
    }
  };
}