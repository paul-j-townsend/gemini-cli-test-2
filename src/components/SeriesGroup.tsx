import { useState } from 'react';
import CompactEpisodeCard from './CompactEpisodeCard';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface SeriesGroupProps {
  title: string;
  description?: string;
  episodes: PodcastEpisode[];
  defaultExpanded?: boolean;
  showEpisodeCount?: boolean;
}

const SeriesGroup: React.FC<SeriesGroupProps> = ({ 
  title, 
  description, 
  episodes, 
  defaultExpanded = true,
  showEpisodeCount = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (a.episode_number && b.episode_number) {
      return b.episode_number - a.episode_number;
    }
    if (a.published_at && b.published_at) {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
    return 0;
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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

  return (
    <div className="mb-12">
      {/* Series Header */}
      <div className="mb-6">
        <button
          onClick={toggleExpanded}
          className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                {title}
                {showEpisodeCount && (
                  <span className="text-lg font-normal text-neutral-500 ml-2">
                    ({episodes.length} episode{episodes.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              {description && (
                <p className="text-neutral-600 text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0 ml-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 group-hover:bg-primary-200 transition-colors flex items-center justify-center">
                {isExpanded ? (
                  <ChevronUp size={20} className="text-primary-600" />
                ) : (
                  <ChevronDown size={20} className="text-primary-600" />
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Episodes Grid */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedEpisodes.map((episode) => (
            <CompactEpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      </div>

      {/* Collapsed State Preview */}
      {!isExpanded && episodes.length > 0 && (
        <div className="opacity-60 hover:opacity-80 transition-opacity">
          <div className="flex gap-4 overflow-hidden">
            {sortedEpisodes.slice(0, 3).map((episode) => (
              <div key={episode.id} className="flex-shrink-0 w-32">
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img 
                    src={getThumbnailUrl(episode)} 
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-medium text-neutral-700 line-clamp-2">
                  {episode.title}
                </h4>
              </div>
            ))}
            {episodes.length > 3 && (
              <div key="more-indicator" className="flex-shrink-0 w-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-lg bg-neutral-100 flex items-center justify-center mb-2">
                    <span className="text-neutral-500 font-medium">
                      +{episodes.length - 3} more
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesGroup;