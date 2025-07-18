import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useUserContentProgress } from '../hooks/useUserContentProgress';
import { 
  Play, 
  Pause, 
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

import { PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface CompactEpisodeCardProps {
  episode: PodcastEpisode;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const CompactEpisodeCard: React.FC<CompactEpisodeCardProps> = ({ episode }) => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isQuizCompleted, isQuizPassedWithThreshold } = useQuizCompletion();
  const quizCompleted = isQuizCompleted(episode.content_id);
  const quizPassed = isQuizPassedWithThreshold(episode.content_id, 70);
  
  // Track certificate download status
  const { certificateDownloaded } = useUserContentProgress(episode.content_id);
  
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const hasAudio = episode.audio_src && episode.audio_src.trim() !== '';

  const getThumbnailUrl = (episode: PodcastEpisode): string => {
    if (!episode || !episode.thumbnail_path || episode.thumbnail_path.trim() === '') {
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    }
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(episode.thumbnail_path);
      return data.publicUrl || 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    } catch (error) {
      console.warn('Error getting thumbnail URL:', error);
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
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
      setCurrentTime(audio.currentTime || 0);
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
    router.push(`/player?id=${episode.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group cursor-pointer">
      {hasAudio && <audio ref={audioRef} src={episode.audio_src} preload="metadata" />}
      
      <div onClick={handleCardClick} className="relative">
        {/* Redesigned layout: horizontal on mobile, vertical on desktop */}
        <div className="flex flex-col">
          {/* Thumbnail - improved aspect ratio */}
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Image 
              src={getThumbnailUrl(episode)} 
              alt={episode.title}
              fill
              className="object-contain object-center group-hover:scale-105 transition-transform duration-300 p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <ExternalLink size={24} className="text-primary-600" />
              </div>
            </div>
            
            {/* Episode number badge */}
            {episode.episode_number && (
              <div className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                S{episode.season || 1} E{episode.episode_number}
              </div>
            )}
            
            {/* Episode completion badge - only show when certificate is downloaded */}
            {certificateDownloaded && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-green-500 text-white">
                  <Check size={12} />
                  <span>Complete</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4 flex-1">
            <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
              {episode.title}
            </h3>
            
            <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
              {episode.description}
            </p>
            
            {/* Episode meta */}
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
              {episode.duration && (
                <span>CPD: {Math.floor(episode.duration / 3600) > 0 ? `${Math.floor(episode.duration / 3600)} hour${Math.floor(episode.duration / 3600) > 1 ? 's' : ''}` : `${Math.floor(episode.duration / 60)} min`}</span>
              )}
              <span>
                {episode.published_at && new Date(episode.published_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview player section */}
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
                <span>Preview</span>
                <span>{formatTime(currentTime)}</span>
              </div>
              
              <div className="relative h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
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
      
      {/* No audio message */}
      {!hasAudio && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <div className="pt-3 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={12} />
            Audio preview not available
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactEpisodeCard;