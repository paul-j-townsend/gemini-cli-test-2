import { useEffect, useRef, useState } from 'react';

interface Podcast {
  title: string;
  description: string;
  audioSrc: string;
}

interface PodcastPlayerItemProps {
  podcast: Podcast;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// React SVG Components instead of dangerous HTML strings
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75H16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
  </svg>
);

const RewindIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
  </svg>
);

const ForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.689ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 12.75 16.811V8.689Z" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const PodcastPlayerItem = ({ podcast }: PodcastPlayerItemProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
      }
    };

    const togglePlayPause = () => {
      setIsPlaying(!audio.paused);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', togglePlayPause);
    audio.addEventListener('pause', togglePlayPause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', () => setIsMuted(audio.muted));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', togglePlayPause);
      audio.removeEventListener('pause', togglePlayPause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', () => setIsMuted(audio.muted));
    };
  }, [isScrubbing]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Pause all other players before playing this one
      document.querySelectorAll('audio').forEach(otherAudio => {
        if (otherAudio !== audio) otherAudio.pause();
      });
      audio.play();
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleVolumeToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleScrubberMouseDown = () => {
    setIsScrubbing(true);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  const handleScrubberMouseUp = () => {
    setIsScrubbing(false);
    if (audioRef.current && !isPlaying) { // Only play if it was playing before scrubbing
      audioRef.current.play();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-2">{podcast.title}</h2>
      <p className="text-slate-600 mb-4">{podcast.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-slate-50 rounded-lg p-3">
        <div className="flex w-full items-center space-x-2 order-1 md:order-2 md:flex-grow min-w-0">
          <span className="text-sm text-slate-500 w-12 text-center">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseDown={handleScrubberMouseDown}
            onMouseUp={handleScrubberMouseUp}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-500 w-12 text-center">{formatTime(duration)}</span>
        </div>
        <div className="flex w-full items-center justify-center space-x-4 order-2 md:order-1 md:w-auto flex-shrink-0">
          <button onClick={handleRewind} className="text-slate-500 hover:text-slate-700 transition-colors">
            <RewindIcon />
          </button>
          <button onClick={handlePlayPause} className="text-slate-700 hover:text-slate-900 transition-colors">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={handleForward} className="text-slate-500 hover:text-slate-700 transition-colors">
            <ForwardIcon />
          </button>
          <button onClick={handleVolumeToggle} className="text-slate-500 hover:text-slate-700 transition-colors">
            {isMuted ? <VolumeMuteIcon /> : <VolumeHighIcon />}
          </button>
        </div>
      </div>
      <audio ref={audioRef} src={podcast.audioSrc} preload="metadata" />
    </div>
  );
};

export default PodcastPlayerItem;
