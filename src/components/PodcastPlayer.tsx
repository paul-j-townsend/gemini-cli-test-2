import { useState, useEffect } from 'react';
import PodcastPlayerItem from './PodcastPlayerItem';
import { supabase } from '@/lib/supabase';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audioSrc: string;
  thumbnail: string;
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  published_at: string;
}

const PodcastPlayer = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vsk_podcast_episodes')
        .select('id, title, description, audio_url, image_url, published_at')
        .order('published_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      const formattedPodcasts: Podcast[] = (data || []).map((episode: PodcastEpisode) => ({
        id: episode.id,
        title: episode.title,
        description: episode.description || '',
        audioSrc: episode.audio_url || '',
        thumbnail: episode.image_url || 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'
      }));

      setPodcasts(formattedPodcasts);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError('Failed to load podcasts');
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
