import { useState, useEffect } from 'react';
import PodcastPlayerItem from './PodcastPlayerItem';
import { supabase } from '@/lib/supabase';
import { useQuizCompletion } from '@/hooks/useQuizCompletion';
import { PodcastEpisode } from '@/types/database';
import { podcastService } from '@/services/podcastService';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_src: string | null;
  full_audio_src?: string | null;
  thumbnail: string;
  content_id: string; // Required - maps to unified content
  quiz?: {
    id: string;
    title: string;
    description: string;
    category: string[];
    total_questions: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    questions: {
      id: string;
      question_number: number;
      question_text: string;
      explanation: string;
      rationale: string;
      learning_outcome: string;
      answers: {
        id: string;
        answer_letter: string;
        answer_text: string;
        is_correct: boolean;
      }[];
    }[];
  };
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
      
      // Use the podcast service to always get complete episode data with quiz info
      const episodes = await podcastService.getPublishedEpisodesClient(4);
      
      const formattedPodcasts: Podcast[] = episodes
        .filter((episode) => {
          // Only filter out episodes without titles - episodes without audio can still be shown as drafts
          const hasValidTitle = episode.title && episode.title.trim() !== '';
          
          if (!hasValidTitle) {
            console.warn('Skipping episode without title:', episode);
            return false;
          }
          
          return true;
        })
        .map((episode) => ({
          id: episode.id,
          title: episode.title || 'Untitled Episode',
          description: episode.description || 'No description available',
          audio_src: episode.audio_src || null, // Preview version - use null instead of empty string
          full_audio_src: episode.full_audio_src || episode.audio_src || null, // Full version or fallback to preview
          thumbnail: getThumbnailUrl(episode as any),
          content_id: episode.content_id,
          // Always include complete quiz data as part of unified entity
          quiz: episode.quiz
        }));

      setPodcasts(formattedPodcasts);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load podcasts. Please check your connection and try again.');
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-glow p-6 animate-pulse">
            {/* Header Section Skeleton */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 rounded-2xl flex-shrink-0"></div>
              <div className="flex-grow min-w-0">
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            
            {/* Progress Bar Skeleton */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
            
            {/* Controls Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="pt-6 border-t border-emerald-200/80">
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
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

  if (podcasts.length === 0 && !error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No podcast episodes available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Check back soon for new content.</p>
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
