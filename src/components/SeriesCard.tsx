import { useState } from 'react';
import { PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface SeriesCardProps {
  title: string;
  description?: string;
  episodes: PodcastEpisode[];
  color: string;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ 
  title, 
  description, 
  episodes, 
  color 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (a.episode_number && b.episode_number) {
      return b.episode_number - a.episode_number;
    }
    if (a.published_at && b.published_at) {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
    return 0;
  });

  const featuredEpisodes = sortedEpisodes.slice(0, 3);

  const getThumbnailUrl = (episode: PodcastEpisode): string => {
    if (!episode.thumbnail_path || episode.thumbnail_path.trim() === '') {
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    }
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(episode.thumbnail_path);
      return data.publicUrl || 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    } catch (error) {
      console.warn('Error getting thumbnail URL:', error);
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&center';
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg bg-white animate-fade-in-up">
      <div 
        className="p-8 text-white relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
        <div className="relative z-10">
          <h3 className="text-2xl lg:text-3xl font-bold mb-3">{title}</h3>
          {description && (
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              {description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-white/80">
            <span className="text-sm font-medium">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </span>
            <span className="text-sm">•</span>
            <span className="text-sm font-medium">Expert Content</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {featuredEpisodes.map((episode, index) => (
            <div key={episode.id} className="group cursor-pointer">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-neutral-100">
                <img 
                  src={getThumbnailUrl(episode)} 
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {episode.title}
                </h4>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {episode.description}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  {episode.episode_number && (
                    <span>Episode {episode.episode_number}</span>
                  )}
                  {episode.duration && (
                    <span>{formatDuration(episode.duration)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {episodes.length > 3 && (
          <div className="text-center">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-6 py-3 border border-primary-300 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-colors duration-200"
            >
              {isExpanded ? 'Show Less' : `View All ${episodes.length} Episodes`}
              <svg 
                className={`ml-2 w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {isExpanded && episodes.length > 3 && (
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEpisodes.slice(3).map((episode) => (
                <div key={episode.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-neutral-100">
                    <img 
                      src={getThumbnailUrl(episode)} 
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                      {episode.title}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {episode.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      {episode.episode_number && (
                        <span>Episode {episode.episode_number}</span>
                      )}
                      {episode.duration && (
                        <span>{formatDuration(episode.duration)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesCard;