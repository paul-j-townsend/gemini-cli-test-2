import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Quiz from './Quiz';



interface Podcast {
  id: string;
  title: string;
  description: string;
  audioSrc: string; // Preview audio
  fullAudioSrc?: string; // Full version audio
  thumbnail: string;
  quizId?: string; // Add quiz ID
}

interface PodcastPlayerItemProps {
  podcast: Podcast;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// Modern React SVG Components
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75H16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
  </svg>
);

const SkipBackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
  </svg>
);

const SkipForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.689ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 12.75 16.811V8.689Z" />
  </svg>
);

const VolumeIcon = ({ isMuted }: { isMuted: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    {isMuted ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    )}
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

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

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const currentAudioSrc = isFullVersion && podcast.fullAudioSrc ? podcast.fullAudioSrc : podcast.audioSrc;

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // Set initial volume and playback rate
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudioSrc, isScrubbing, volume, playbackRate]);

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

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
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
    if (podcast.fullAudioSrc) {
      setIsFullVersion(true);
      setHasAccessedFull(true);
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
          <h3 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-1 line-clamp-2">
            {podcast.title}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {podcast.description}
          </p>
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
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Main Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSkipBack}
            className="audio-control w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
            aria-label="Skip back 15 seconds"
          >
            <SkipBackIcon />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="audio-control w-12 h-12 flex items-center justify-center text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-soft hover:shadow-medium focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>
          
          <button
            onClick={handleSkipForward}
            className="audio-control w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
            aria-label="Skip forward 15 seconds"
          >
            <SkipForwardIcon />
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
              <VolumeIcon isMuted={isMuted} />
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
            <SpeedIcon />
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
            <VolumeIcon isMuted={isMuted} />
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
            disabled={!podcast.fullAudioSrc}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
                Close Quiz
              </button>
            ) : (
              <button 
                onClick={() => setShowQuiz(true)}
                disabled={!podcast.quizId}
                className={`btn-secondary w-full sm:w-auto flex-1 flex items-center justify-center gap-2 ${
                  !podcast.quizId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M15.94 2.94a.75.75 0 0 1 0 1.06L6.31 12.69a.75.75 0 0 0 1.06 1.06L17 4.06a.75.75 0 0 1-1.06-1.06Zm-6.75 4.5a.75.75 0 0 1 0 1.06L4.56 13l4.63-4.63a.75.75 0 0 1 1.06 0ZM3.5 12a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
                {podcast.quizId ? 'Take Quiz' : 'No Quiz Available'}
              </button>
            )}
            <button className="btn-primary w-full sm:w-auto flex-1 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M9.25 12.25a.75.75 0 0 0 1.5 0V4.57l2.053 2.053a.75.75 0 0 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 1 0 1.06 1.06L9.25 4.57v7.68ZM2 14.25a.75.75 0 0 0 0 1.5h16a.75.75 0 0 0 0-1.5H2Z" />
              </svg>
              Get Certificate
            </button>
          </>
        )}
      </div>

      {/* Quiz Component */}
      {showQuiz && podcast.quizId && (
        <div className="mt-6 pt-6 border-t border-neutral-200/80">
          <Quiz quizId={podcast.quizId} />
        </div>
      )}
    </div>
  );
};

export default PodcastPlayerItem;
