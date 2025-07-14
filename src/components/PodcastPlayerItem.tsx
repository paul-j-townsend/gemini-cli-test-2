import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Quiz from './Quiz';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings,
  Check,
  X,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_src: string | null; // Preview audio
  full_audio_src?: string | null; // Full version audio
  thumbnail: string;
  content_id: string; // Required - maps to unified content
}

interface PodcastPlayerItemProps {
  podcast: Podcast;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};


const PodcastPlayerItem: React.FC<PodcastPlayerItemProps> = ({ podcast }) => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullVersion, setIsFullVersion] = useState(false);
  const [hasAccessedFull, setHasAccessedFull] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  
  // Quiz completion checking - every podcast now has a quiz
  const { isQuizCompleted, isQuizPassed, getQuizPercentage, isQuizPassedWithThreshold } = useQuizCompletion();
  const quizCompleted = isQuizCompleted(podcast.content_id);
  const quizPercentage = getQuizPercentage(podcast.content_id);
  
  // Use the robust threshold-based checking instead of manual validation
  // This properly validates percentage against the actual pass criteria
  // TODO: Get actual quiz pass percentage from quiz data instead of defaulting to 70%
  const quizPassed = isQuizPassedWithThreshold(podcast.content_id, 70);


  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const currentAudioSrc = isFullVersion && podcast.full_audio_src ? podcast.full_audio_src : podcast.audio_src;
  const hasAudio = currentAudioSrc && currentAudioSrc.trim() !== '';

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Skip audio setup if no audio source is available
    if (!hasAudio) {
      setIsLoading(false);
      setError(null);
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
      setAudioReady(true);
      setRetryCount(0); // Reset retry count on successful load
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

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      setAudioReady(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (event: Event) => {
      // Only log the first error to avoid spam
      if (retryCount === 0) {
        console.warn('Audio loading failed for:', currentAudioSrc);
      }
      
      setIsLoading(false);
      setIsPlaying(false);
      setAudioReady(false);
      
      // Provide more specific error messages with limited retries
      if (retryCount < 1) { // Reduced retry attempts from 2 to 1
        setError(`Loading audio... (attempt ${retryCount + 1}/2)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          if (audio) {
            audio.load();
          }
        }, 2000); // Increased delay between retries
      } else {
        setError('Audio unavailable');
        // Don't retry anymore to prevent console spam
      }
    };

    const handleStalled = () => {
      // Only log if we don't already have an error state
      if (!error) {
        console.warn('Audio stalled for:', currentAudioSrc);
      }
      setIsLoading(false);
      setError('Audio buffering - please wait');
      // Auto-retry after stall
      setTimeout(() => {
        if (audio && !audio.ended && !isPlaying && !error?.includes('unavailable')) {
          setError(null);
          setIsLoading(true);
        }
      }, 3000); // Increased timeout
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleSuspend = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('suspend', handleSuspend);

    // Set initial volume and playback rate
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    // Add timeout to prevent indefinite loading
    const loadTimeout = setTimeout(() => {
      if (isLoading && !error) {
        console.warn('Audio load timeout for:', currentAudioSrc);
        setIsLoading(false);
        setIsPlaying(false);
        setError('Audio unavailable');
      }
    }, 8000); // Increased timeout to 8 seconds

    return () => {
      clearTimeout(loadTimeout);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('suspend', handleSuspend);
    };
  }, [currentAudioSrc, isScrubbing, volume, playbackRate, isLoading, hasAudio]);

  // Update audio source when switching between preview and full version
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = isPlaying;
      const currentTimePos = currentTime;
      
      audio.src = currentAudioSrc;
      audio.load();
      
      if (wasPlaying) {
        audio.currentTime = currentTimePos;
        audio.play().catch(console.error);
      }
    }
  }, [currentAudioSrc]);

  // Play/Pause handler
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check for invalid audio source
    if (!hasAudio) {
      setError('No audio available');
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setError(null);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to play audio');
    }
  };

  // Scrubber handlers
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (!isScrubbing) {
      audio.currentTime = newTime;
    }
  };

  const handleScrubberMouseDown = () => {
    setIsScrubbing(true);
  };

  const handleScrubberMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsScrubbing(false);
    const target = e.target as HTMLInputElement;
    const newTime = parseFloat(target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Skip handlers
  const handleSkipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, currentTime - 15);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.min(duration, currentTime + 15);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume handlers
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleVolumeToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume;
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  // Speed handler
  const handleSpeedChange = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 10];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setPlaybackRate(nextSpeed);
    audio.playbackRate = nextSpeed;
  };

  // Full version handler
  const handleListenToFull = () => {
    if (podcast.full_audio_src && podcast.full_audio_src.trim() !== '') {
      router.push(`/player?id=${podcast.id}`);
    } else {
      setError('Full version not available');
    }
  };

  return (
    <div className="card-glow p-6 animate-fade-in-up hover-lift group">
      {hasAudio && <audio ref={audioRef} src={currentAudioSrc} preload="metadata" />}
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <div className="relative flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
          <div className="w-20 h-20 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-medium group-hover:shadow-hard transition-all duration-300">
            <Image 
              src={podcast.thumbnail} 
              alt={`${podcast.title} thumbnail`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              width={80}
              height={80}
              loading="lazy"
            />
          </div>
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center animate-pulse-soft">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce-soft"></div>
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
            <div className="flex-grow min-w-0 w-full sm:w-auto">
              <h3 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-1 line-clamp-2 text-center sm:text-left">
                {podcast.title}
              </h3>
              <p className="text-sm text-neutral-600 line-clamp-3 sm:line-clamp-2 leading-relaxed mb-2 text-center sm:text-left">
                {podcast.description}
              </p>
              <div className="flex justify-center sm:justify-start">
                <Link 
                  href={`/player?id=${podcast.id}`}
                  className="inline-flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Open in Full Player</span>
                </Link>
              </div>
            </div>
            
            {/* Quiz Completion Indicator */}
            {quizCompleted && (
              <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end sm:ml-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  quizPassed 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  {quizPassed ? (
                    <Check size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  <span>
                    {quizPassed ? 'Complete' : 
                     quizCompleted ? 'Incomplete' : 'Not Started'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar - Only show if audio exists */}
      {hasAudio && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="font-medium">{formatTime(duration)}</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleScrubberChange}
              onMouseDown={handleScrubberMouseDown}
              onMouseUp={handleScrubberMouseUp}
              onTouchStart={handleScrubberMouseDown}
              onTouchEnd={handleScrubberMouseUp}
              className="audio-player-progress w-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${progressPercentage}%, rgb(228, 228, 231) ${progressPercentage}%, rgb(228, 228, 231) 100%)`
              }}
            />
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse"></div>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className={`mt-2 p-2 rounded-lg ${
              retryCount < 2 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm flex items-center gap-2 ${
                retryCount < 2 ? 'text-yellow-700' : 'text-red-600'
              }`}>
                <AlertCircle size={16} />
                {error}
                {retryCount < 2 && (
                  <span className="ml-auto text-xs opacity-75">Retrying...</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* No Audio Message */}
      {!hasAudio && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle size={16} />
            Audio not available for this episode
          </p>
          <p className="text-xs text-amber-600 mt-1">You can still take the quiz to earn your certificate.</p>
        </div>
      )}

      {/* Controls - Only show if audio exists */}
      {hasAudio && (
        <div className="flex items-center justify-between mb-6">
          {/* Main Controls */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-2">
            <button
              onClick={handleSkipBack}
              className="audio-control w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 touch-manipulation"
              disabled={isLoading || (!audioReady && !!error)}
              aria-label="Skip back 15 seconds"
            >
              <SkipBack size={18} className="sm:w-4 sm:h-4" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="audio-control w-14 h-14 sm:w-12 sm:h-12 flex items-center justify-center text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-soft hover:shadow-medium focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 touch-manipulation"
              disabled={isLoading || (!audioReady && !!error)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-6 h-6 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause size={22} className="sm:w-5 sm:h-5" />
              ) : (
                <Play size={22} className="sm:w-5 sm:h-5" />
              )}
            </button>
            
            <button
              onClick={handleSkipForward}
              className="audio-control w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 touch-manipulation"
              disabled={isLoading || (!audioReady && !!error)}
              aria-label="Skip forward 15 seconds"
            >
              <SkipForward size={18} className="sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Volume Control */}
            <div className="flex items-center space-x-2 group/volume">
              <button
                onClick={handleVolumeToggle}
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="transition-opacity duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${(isMuted ? 0 : volume) * 100}%, rgb(228, 228, 231) ${(isMuted ? 0 : volume) * 100}%, rgb(228, 228, 231) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Speed Control */}
            <button
              onClick={handleSpeedChange}
              className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              aria-label={`Playback speed: ${playbackRate}x`}
            >
              <Settings size={16} />
              <span>{playbackRate}x</span>
            </button>
          </div>

          {/* Mobile Secondary Controls */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={handleVolumeToggle}
              className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 touch-manipulation"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={handleSpeedChange}
              className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 touch-manipulation min-w-[3rem]"
              aria-label={`Playback speed: ${playbackRate}x`}
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 border-t border-neutral-200/80 flex flex-col gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {hasAudio ? (
          /* Show audio-related actions if audio exists */
          !hasAccessedFull ? (
            <button 
              onClick={handleListenToFull}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!podcast.full_audio_src}
            >
              <Play size={20} />
              Listen to Full Version
            </button>
          ) : (
            /* Show Quiz and Certificate buttons after accessing full version */
            <>
              {showQuiz ? (
                <button 
                  onClick={() => setShowQuiz(false)}
                  className="btn-secondary w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Close Quiz
                </button>
              ) : (
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="btn-secondary w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
                >
                  <Settings size={20} />
                  Take Quiz
                </button>
              )}
              <button 
                disabled={!quizPassed}
                className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 ${
                  quizPassed 
                    ? 'btn-primary' 
                    : 'btn-secondary opacity-50 cursor-not-allowed'
                }`}
              >
                <Download size={20} />
                {quizPassed ? 'Get Certificate' : 'Pass Quiz to Get Certificate'}
              </button>
            </>
          )
        ) : (
          /* Show quiz-only actions if no audio */
          <>
            {showQuiz ? (
              <button 
                onClick={() => setShowQuiz(false)}
                className="btn-secondary w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
              >
                <X size={20} />
                Close Quiz
              </button>
            ) : (
              <button 
                onClick={() => setShowQuiz(true)}
                className="btn-primary w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
              >
                <Settings size={20} />
                Take Quiz
              </button>
            )}
            <button 
              disabled={!quizPassed}
              className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 ${
                quizPassed 
                  ? 'btn-primary' 
                  : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              <Download size={20} />
              {quizPassed ? 'Get Certificate' : 'Complete Quiz for Certificate'}
            </button>
          </>
        )}
      </div>

      {/* Quiz Component */}
      {showQuiz && (
        <div className="mt-6 pt-6 border-t border-neutral-200/80">
          <Quiz quizId={podcast.content_id} episodeTitle={podcast.title} />
        </div>
      )}
    </div>
  );
};

export default PodcastPlayerItem;
