import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Define audio file mappings for our 3 episodes
    const audioMappings = [
      {
        id: '20000000-0000-0000-0000-000000000001', // Ethics in Veterinary Practice
        audio_src: '/audio/the_evolving_world_of_animal_healthcare.mp3',
        full_audio_src: '/audio/the_evolving_world_of_animal_healthcare.mp3'
      },
      {
        id: '20000000-0000-0000-0000-000000000002', // Pain Assessment and Management
        audio_src: '/audio/the_future_of_uk_companion_animal_veterinary_care.mp3',
        full_audio_src: '/audio/the_future_of_uk_companion_animal_veterinary_care.mp3'
      },
      {
        id: '20000000-0000-0000-0000-000000000003', // Surgical Nursing Excellence
        audio_src: '/audio/walkalone.mp3',
        full_audio_src: '/audio/walkalone.mp3'
      }
    ];

    const updateResults = [];

    // Update each episode with real audio URLs
    for (const mapping of audioMappings) {
      const { data, error } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .update({
          audio_src: mapping.audio_src,
          full_audio_src: mapping.full_audio_src,
          updated_at: new Date().toISOString()
        })
        .eq('id', mapping.id)
        .select('id, title, audio_src, full_audio_src');

      if (error) {
        console.error(`Error updating episode ${mapping.id}:`, error);
        updateResults.push({
          id: mapping.id,
          success: false,
          error: error.message
        });
      } else {
        updateResults.push({
          id: mapping.id,
          success: true,
          data: data?.[0] || null
        });
      }
    }

    const successCount = updateResults.filter(r => r.success).length;
    const errorCount = updateResults.filter(r => !r.success).length;

    return res.status(200).json({
      success: errorCount === 0,
      message: `Updated ${successCount} episodes with real audio URLs`,
      data: {
        results: updateResults,
        summary: {
          total: audioMappings.length,
          successful: successCount,
          failed: errorCount
        }
      }
    });

  } catch (error) {
    console.error('Update audio URLs error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}