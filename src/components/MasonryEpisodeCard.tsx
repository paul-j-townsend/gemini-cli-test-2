import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useUserContentProgress } from '../hooks/useUserContentProgress';
import PurchaseCPDButton from './payments/PurchaseCPDButton';
import { 
  Play, 
  Pause, 
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

import { PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface MasonryEpisodeCardProps {
  episode: PodcastEpisode & { seriesName?: string };
  seriesName?: string;
  seriesColor?: string;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const MasonryEpisodeCard: React.FC<MasonryEpisodeCardProps> = ({ 
  episode, 
  seriesName, 
  seriesColor = '#3B82F6' 
}) => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  
  const { isQuizCompleted, isQuizPassedWithThreshold } = useQuizCompletion();
  const quizCompleted = isQuizCompleted(episode.content_id);
  const quizPassed = isQuizPassedWithThreshold(episode.content_id, 70);
  
  const { certificateDownloaded } = useUserContentProgress(episode.content_id);
  
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const displayPercentage = isScrubbing ? scrubPosition : progressPercentage;
  const displayTime = isScrubbing ? (scrubPosition / 100) * duration : currentTime;
  
  const getDefaultAudioUrl = (): string => {
    // Try to get from Supabase storage first, fallback to a sample audio
    try {
      const { data } = supabase.storage
        .from('audio')
        .getPublicUrl('episodes/1753642561183-walkalone.mp3');
      return data.publicUrl;
    } catch (error) {
      // Fallback to a basic audio file (or return null to disable audio)
      return "/audio/walkalone.mp3";
    }
  };

  const getAudioUrl = (episode: PodcastEpisode): string => {
    if (episode.audio_src && episode.audio_src.trim() !== '') {
      return episode.audio_src;
    }
    return getDefaultAudioUrl();
  };

  const hasAudio = episode.audio_src && episode.audio_src.trim() !== '';

  const getDefaultThumbnailUrl = (): string => {
    // Try to get from Supabase storage first, fallback to placeholder
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl('thumbnails/1753642620645-zoonoses-s1e2.png');
      return data.publicUrl;
    } catch (error) {
      // Fallback to a reliable placeholder image
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    }
  };

  const getThumbnailUrl = (episode: PodcastEpisode): string => {
    if (!episode || !episode.thumbnail_path || episode.thumbnail_path.trim() === '') {
      return getDefaultThumbnailUrl();
    }
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(episode.thumbnail_path);
      return data.publicUrl || getDefaultThumbnailUrl();
    } catch (error) {
      console.warn('Error getting thumbnail URL:', error);
      return getDefaultThumbnailUrl();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime || 0);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Preview unavailable');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [hasAudio]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setError(null);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Playback failed');
      setIsPlaying(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/player?id=${episode.content_id}`);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.max(0, Math.min(percentage * duration, duration));
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);
    const progressBar = e.currentTarget;
    
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (!progressBar) return;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setScrubPosition(percentage);
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      if (!progressBar) return;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = Math.max(0, Math.min(x / rect.width, 1));
      const newTime = percentage * duration;
      
      const audio = audioRef.current;
      if (audio && duration) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
      
      setIsScrubbing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`mb-6 break-inside-avoid bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden ${isScrubbing ? 'select-none' : ''}`}>
      {hasAudio && <audio ref={audioRef} src={getAudioUrl(episode)} preload="metadata" />}
      
      <div onClick={handleCardClick} className="relative group cursor-pointer">
        <div className="flex flex-col">
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Image 
              src={getThumbnailUrl(episode)} 
              alt={episode.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <ExternalLink size={24} className="text-primary-600" />
              </div>
            </div>
            
            {episode.episode_number && (
              <div className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                S{episode.season || 1} E{episode.episode_number}
              </div>
            )}
            
            <div className="absolute top-3 right-3">
              {certificateDownloaded ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-green-500 text-white">
                  <Check size={12} />
                  <span>Complete</span>
                </div>
              ) : (
                <div onClick={(e) => e.stopPropagation()}>
                  <PurchaseCPDButton 
                    contentId={episode.content_id}
                    contentTitle={episode.title}
                    variant="compact"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 flex-1">
            {seriesName && (
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: seriesColor }}
                />
                <span className="text-xs font-medium text-neutral-600">
                  {seriesName}
                </span>
              </div>
            )}
            
            <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
              {episode.title}
            </h3>
            
            
            <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
              {episode.description}
            </p>
            
            <div className="text-xs text-neutral-500 mb-3">
              {episode.duration && (
                <div className="font-bold">CPD: {Math.floor(episode.duration / 3600) > 0 ? `${Math.floor(episode.duration / 3600)} hour${Math.floor(episode.duration / 3600) > 1 ? 's' : ''}` : `${Math.floor(episode.duration / 60)} min`}</div>
              )}
              <div>
                {episode.published_at && new Date(episode.published_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {hasAudio && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div 
                className="relative h-1 bg-neutral-200 rounded-full cursor-pointer hover:h-1.5 transition-all duration-200 group"
                onClick={handleSeek}
                onMouseDown={handleScrubberMouseDown}
              >
                <div 
                  className={`absolute top-0 left-0 h-full bg-primary-600 rounded-full ${isScrubbing ? '' : 'transition-all duration-100'}`}
                  style={{ width: `${displayPercentage}%` }}
                />
                <div 
                  className={`absolute top-1/2 transform -translate-y-1/2 bg-primary-600 rounded-full border-2 border-white shadow-sm ${isScrubbing ? 'w-4 h-4 shadow-md' : 'w-3 h-3 group-hover:w-4 group-hover:h-4 group-hover:shadow-md'} ${isScrubbing ? '' : 'transition-all duration-200'}`}
                  style={{ left: `${displayPercentage}%`, marginLeft: '-6px' }}
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default MasonryEpisodeCard;