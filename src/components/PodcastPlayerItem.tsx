import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  Download
} from 'lucide-react';



interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_src: string; // Preview audio
  full_audio_src?: string; // Full version audio
  thumbnail: string;
  quiz_id?: string; // Add quiz ID
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
  
  // Quiz completion checking
  const { isQuizCompleted, isQuizPassed, getQuizPercentage, isQuizPassedWithThreshold } = useQuizCompletion();
  const quizCompleted = podcast.quiz_id ? isQuizCompleted(podcast.quiz_id) : false;
  const quizPercentage = podcast.quiz_id ? getQuizPercentage(podcast.quiz_id) : 0;
  
  // Use the robust threshold-based checking instead of manual validation
  // This properly validates percentage against the actual pass criteria
  // TODO: Get actual quiz pass percentage from quiz data instead of defaulting to 70%
  const quizPassed = podcast.quiz_id ? 
    isQuizPassedWithThreshold(podcast.quiz_id, 70) : 
    false;


  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const currentAudioSrc = isFullVersion && podcast.full_audio_src ? podcast.full_audio_src : podcast.audio_src;

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Validate audio source
    if (!currentAudioSrc || currentAudioSrc.trim() === '') {
      console.error('Invalid audio source:', currentAudioSrc);
      setIsLoading(false);
      setError('Invalid audio source');
      return;
    }

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

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (event: Event) => {
      console.error('Audio loading error for:', currentAudioSrc, event);
      setIsLoading(false);
      setIsPlaying(false);
      setError('Failed to load audio');
    };

    const handleStalled = () => {
      console.warn('Audio stalled for:', currentAudioSrc);
      setIsLoading(false);
      setError('Audio playback stalled');
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
      if (isLoading) {
        console.warn('Audio load timeout for:', currentAudioSrc);
        setIsLoading(false);
        setIsPlaying(false);
        setError('Audio loading timeout');
      }
    }, 5000); // 5 second timeout

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
  }, [currentAudioSrc, isScrubbing, volume, playbackRate, isLoading]);

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
    if (!currentAudioSrc || currentAudioSrc.trim() === '') {
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

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setPlaybackRate(nextSpeed);
    audio.playbackRate = nextSpeed;
  };

  // Full version handler
  const handleListenToFull = () => {
    if (podcast.full_audio_src && podcast.full_audio_src.trim() !== '') {
      setError(null);
      setIsFullVersion(true);
      setHasAccessedFull(true);
    } else {
      setError('Full version not available');
    }
  };

  return (
    <div className="card-glow p-6 animate-fade-in-up hover-lift group">
      <audio ref={audioRef} src={currentAudioSrc} preload="metadata" />
      
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-medium group-hover:shadow-hard transition-all duration-300">
            <Image 
              src={podcast.thumbnail} 
              alt={`${podcast.title} thumbnail`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              width={80}
              height={80}
            />
          </div>
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center animate-pulse-soft">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce-soft"></div>
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-grow min-w-0">
              <h3 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-1 line-clamp-2">
                {podcast.title}
              </h3>
              <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                {podcast.description}
              </p>
            </div>
            
            {/* Quiz Completion Indicator */}
            {quizCompleted && (
              <div className="flex-shrink-0 ml-3">
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
                    {quizPassed ? `Passed (${quizPercentage}%)` : 
                     quizCompleted ? `Failed (${quizPercentage}%)` : 'Not Completed'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
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
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Main Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSkipBack}
            className="audio-control w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || !!error}
            aria-label="Skip back 15 seconds"
          >
            <SkipBack size={16} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="audio-control w-12 h-12 flex items-center justify-center text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-soft hover:shadow-medium focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || !!error}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
          
          <button
            onClick={handleSkipForward}
            className="audio-control w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || !!error}
            aria-label="Skip forward 15 seconds"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="hidden sm:flex items-center space-x-3">
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
        <div className="sm:hidden flex items-center space-x-2">
          <button
            onClick={handleVolumeToggle}
            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={handleSpeedChange}
            className="px-2 py-1 text-xs font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            aria-label={`Playback speed: ${playbackRate}x`}
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {!hasAccessedFull ? (
          /* Show Listen to Full Version button initially */
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
                disabled={!podcast.quiz_id}
                className={`btn-secondary w-full sm:w-auto flex-1 flex items-center justify-center gap-2 ${
                  !podcast.quiz_id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                  <Settings size={20} />
                {podcast.quiz_id ? 'Take Quiz' : 'No Quiz Available'}
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
        )}
      </div>

      {/* Quiz Component */}
      {showQuiz && podcast.quiz_id && (
        <div className="mt-6 pt-6 border-t border-neutral-200/80">
          <Quiz quizId={podcast.quiz_id} />
        </div>
      )}
    </div>
  );
};

export default PodcastPlayerItem;
