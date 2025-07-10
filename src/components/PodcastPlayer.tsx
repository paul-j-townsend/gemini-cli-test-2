import { useState, useEffect } from 'react';
import PodcastPlayerItem from './PodcastPlayerItem';
import { supabase } from '@/lib/supabase';
import { useQuizCompletion } from '@/hooks/useQuizCompletion';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_src: string | null;
  full_audio_src?: string | null;
  thumbnail: string;
  quiz_id?: string;
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_src: string;
  thumbnail_path: string;
  published_at: string;
  episode_number?: number;
  season?: number;
  duration?: number;
  slug?: string;
  published?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
  full_audio_src?: string;
  quiz_id?: string;
  quiz?: {
    id: string;
    title: string;
    description?: string;
    total_questions: number;
  } | null;
}

const PodcastPlayer = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshData } = useQuizCompletion();

  useEffect(() => {
    fetchPodcasts();
    // Refresh quiz completion data when episodes page loads
    refreshData();
  }, []); // Remove refreshData dependency to prevent infinite loop

  const getThumbnailUrl = (episode: PodcastEpisode): string => {
    if (!episode.thumbnail_path) {
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    }
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(episode.thumbnail_path);
    return data.publicUrl;
  };

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start with basic query, then try enhanced if it works
      let { data, error } = await supabase
        .from('vsk_podcast_episodes')
        .select('id, title, description, audio_src, thumbnail_path, published_at, full_audio_src, quiz_id')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(4);

      // If basic query fails, try even simpler
      if (error) {
        console.log('Basic query failed, trying minimal query:', error);
        const minimalResult = await supabase
          .from('vsk_podcast_episodes')
          .select('id, title, description, audio_src, thumbnail_path, published_at')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(4);
        
        data = minimalResult.data as any;
        error = minimalResult.error;
      }

      if (error) throw error;

      const formattedPodcasts: Podcast[] = (data || [])
        .filter((episode: any) => {
          // Only filter out episodes without titles - episodes without audio can still be shown as drafts
          const hasValidTitle = episode.title && episode.title.trim() !== '';
          
          if (!hasValidTitle) {
            console.warn('Skipping episode without title:', episode);
            return false;
          }
          
          return true;
        })
        .map((episode: any) => ({
          id: episode.id,
          title: episode.title || 'Untitled Episode',
          description: episode.description || 'No description available',
          audio_src: episode.audio_src || null, // Preview version - use null instead of empty string
          full_audio_src: episode.full_audio_src || episode.audio_src || null, // Full version or fallback to preview
          thumbnail: getThumbnailUrl(episode),
          quiz_id: episode.quiz_id || undefined
        }));

      // If no valid podcasts found, add some mock data for testing
      if (formattedPodcasts.length === 0) {
        const mockPodcasts: Podcast[] = [
          {
            id: 'mock-1',
            title: 'Animal Anatomy & Physiology',
            description: 'Understanding animal body systems and their functions',
            audio_src: 'https://www.soundjay.com/misc/sounds/computer-01.wav',
            full_audio_src: 'https://www.soundjay.com/misc/sounds/computer-01.wav',
            thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center',
            quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7'
          },
          {
            id: 'mock-2',
            title: 'Veterinary Fundamentals',
            description: 'Basic principles of veterinary medicine and practice',
            audio_src: 'https://www.soundjay.com/misc/sounds/computer-02.wav',
            full_audio_src: 'https://www.soundjay.com/misc/sounds/computer-02.wav',
            thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center',
            quiz_id: 'quiz-1'
          }
        ];
        setPodcasts(mockPodcasts);
      } else {
        // Assign quiz IDs to existing podcasts for testing if they don't have them
        const podcastsWithQuizIds = formattedPodcasts.map((podcast, index) => {
          if (!podcast.quiz_id) {
            // Assign quiz IDs based on title or index
            if (podcast.title.toLowerCase().includes('anatomy') || podcast.title === 'a' || index === 0) {
              podcast.quiz_id = 'fed2a63e-196d-43ff-9ebc-674db34e72a7';
            } else {
              podcast.quiz_id = '550e8400-e29b-41d4-a716-446655440000';
            }
          }
          return podcast;
        });
        setPodcasts(podcastsWithQuizIds);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError('Failed to load podcasts');
      
      // Fallback to mock data on error
      const mockPodcasts: Podcast[] = [
        {
          id: 'mock-1',
          title: 'Animal Anatomy & Physiology',
          description: 'Understanding animal body systems and their functions',
          audio_src: 'https://www.soundjay.com/misc/sounds/computer-01.wav',
          full_audio_src: 'https://www.soundjay.com/misc/sounds/computer-01.wav',
          thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7'
        }
      ];
      setPodcasts(mockPodcasts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchPodcasts}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No podcast episodes available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {podcasts.map((podcast) => (
        <PodcastPlayerItem key={podcast.id} podcast={podcast} />
      ))}
    </div>
  );
};

export default PodcastPlayer;
