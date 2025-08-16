import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUserContentProgress } from '../hooks/useUserContentProgress';
import { useUser } from '@/contexts/UserContext';
import PurchaseCPDButton from './payments/PurchaseCPDButton';
import PurchaseModal from './PurchaseModal';
import { 
  Play, 
  Pause, 
  Check,
  AlertCircle,
  ExternalLink,
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
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Track certificate download status
  const { certificateDownloaded } = useUserContentProgress(episode.content_id);
  const { user, hasFullCPDAccess } = useUser();
  
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const displayPercentage = isScrubbing ? scrubPosition : progressPercentage;
  const displayTime = isScrubbing ? (scrubPosition / 100) * duration : currentTime;

  // Check if user has access to this content
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const access = await hasFullCPDAccess(episode.content_id);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, episode.content_id, hasFullCPDAccess]);
  
  const getDefaultAudioUrl = (): string => {
    const { data } = supabase.storage
      .from('audio')
      .getPublicUrl('episodes/1753642561183-walkalone.mp3');
    return data.publicUrl;
  };

  const getAudioUrl = (episode: PodcastEpisode): string => {
    if (episode.audio_src && episode.audio_src.trim() !== '') {
      return episode.audio_src;
    }
    return getDefaultAudioUrl();
  };

  const hasAudio = true;

  const getDefaultThumbnailUrl = (): string => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl('thumbnails/1753642620645-zoonoses-s1e2.png');
    return data.publicUrl;
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
    if (hasAccess) {
      // User has purchased, go to player
      router.push(`/player?id=${episode.content_id}`);
    } else {
      // User hasn't purchased, show purchase modal
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseComplete = () => {
    // Refresh access status after purchase
    setHasAccess(true);
    // Navigate to player
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

  const handleScrubberTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);
    const progressBar = e.currentTarget;
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (!progressBar || event.touches.length === 0) return;
      const rect = progressBar.getBoundingClientRect();
      const x = event.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setScrubPosition(percentage);
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      if (!progressBar || event.changedTouches.length === 0) return;
      const rect = progressBar.getBoundingClientRect();
      const x = event.changedTouches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(x / rect.width, 1));
      const newTime = percentage * duration;
      
      const audio = audioRef.current;
      if (audio && duration) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
      
      setIsScrubbing(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden ${isScrubbing ? 'select-none' : ''}`}>
      {hasAudio && <audio ref={audioRef} src={getAudioUrl(episode)} preload="metadata" />}
      
      <div onClick={handleCardClick} className="relative group cursor-pointer">
        {/* Redesigned layout: horizontal on mobile, vertical on desktop */}
        <div className="flex flex-col">
          {/* Thumbnail - improved aspect ratio */}
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200">
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
                <ExternalLink size={24} className="text-emerald-600" />
              </div>
            </div>
            
            
            {/* Episode completion/purchase badge */}
            <div className="absolute top-3 left-3">
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
          
          {/* Content */}
          <div className="p-4 flex-1">
            <h3 className="font-semibold text-lg text-emerald-900 mb-2 line-clamp-2">
              {episode.title}
            </h3>
            
            <p className="text-sm text-emerald-700 mb-3 line-clamp-3">
              {episode.description}
            </p>
            
            {/* Episode meta */}
            <div className="text-xs text-emerald-500 mb-3">
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
      
      {/* Preview player section */}
      {hasAudio && (
        <div className="px-4 pb-4 border-t border-emerald-100">
          <div className="text-xs font-medium text-emerald-500 pt-3 pb-2">
            Podcast preview
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
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
              <div className="flex items-center justify-between text-xs text-emerald-500 mb-1">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div 
                className="relative h-1 bg-emerald-200 rounded-full cursor-pointer hover:h-1.5 transition-all duration-200 group"
                onClick={handleSeek}
                onMouseDown={handleScrubberMouseDown}
                onTouchStart={handleScrubberTouchStart}
              >
                <div 
                  className={`absolute top-0 left-0 h-full bg-emerald-600 rounded-full ${isScrubbing ? '' : 'transition-all duration-100'}`}
                  style={{ width: `${displayPercentage}%` }}
                />
                {/* Playhead circle */}
                <div 
                  className={`absolute top-1/2 transform -translate-y-1/2 bg-emerald-600 rounded-full border-2 border-white shadow-sm ${isScrubbing ? 'w-4 h-4 shadow-md' : 'w-3 h-3 group-hover:w-4 group-hover:h-4 group-hover:shadow-md'} ${isScrubbing ? '' : 'transition-all duration-200'}`}
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
      
      {/* Purchase Modal */}
      <PurchaseModal
        episode={episode}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
};

export default CompactEpisodeCard;