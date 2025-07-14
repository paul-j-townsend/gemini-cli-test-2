import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Quiz from '@/components/Quiz';
import { supabase } from '@/lib/supabase';
import { useQuizCompletion } from '@/hooks/useQuizCompletion';
import { podcastService, PodcastEpisode } from '@/services/podcastService';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings,
  ArrowLeft,
  Download,
  Check,
  X,
  AlertCircle
} from 'lucide-react';


const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const PodcastPlayer = () => {
  const router = useRouter();
  const { id } = router.query;
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Episode state
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Quiz completion state
  const { isQuizCompleted, isQuizPassedWithThreshold, getQuizPercentage } = useQuizCompletion();
  
  const quizCompleted = episode?.quiz_id ? isQuizCompleted(episode.quiz_id) : false;
  const quizPassed = episode?.quiz_id ? isQuizPassedWithThreshold(episode.quiz_id, 70) : false;
  const quizPercentage = episode?.quiz_id ? getQuizPercentage(episode.quiz_id) : 0;
  
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const currentAudioSrc = episode?.full_audio_src || episode?.audio_src;

  // Fetch episode data with complete quiz information
  useEffect(() => {
    if (!id) return;
    
    const fetchEpisode = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use podcastService to get complete episode data with quiz info
        const episodeData = await podcastService.getEpisodeByIdClient(id as string);
        
        if (!episodeData) throw new Error('Episode not found');
        
        setEpisode(episodeData);
      } catch (err) {
        console.error('Error fetching episode:', err);
        setError('Failed to load episode');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEpisode();
  }, [id]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioSrc) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => {
      if (!isScrubbing) setCurrentTime(audio.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudioSrc, isScrubbing, volume, playbackRate]);

  // Player controls
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentAudioSrc) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback failed');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const getThumbnailUrl = (thumbnailPath: string): string => {
    if (!thumbnailPath) {
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=600&fit=crop&crop=center';
    }
    const { data } = supabase.storage.from('images').getPublicUrl(thumbnailPath);
    return data.publicUrl;
  };

  const downloadCertificate = () => {
    if (!quizPassed) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

    ctx.font = '24px Arial';
    ctx.fillText(episode?.title || 'Podcast Episode', canvas.width / 2, 250);

    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${quizPercentage}%`, canvas.width / 2, 350);
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, 450);

    const link = document.createElement('a');
    link.download = `certificate-${episode?.title || 'episode'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !episode) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Episode Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The requested episode could not be found.'}</p>
            <button 
              onClick={() => router.push('/podcasts')}
              className="btn-primary"
            >
              Back to Episodes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{episode.title} - Vet Sidekick Player</title>
        <meta name="description" content={episode.description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        {/* Header */}
        <div className="container-wide py-6">
          <button
            onClick={() => router.push('/podcasts')}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Episodes</span>
          </button>
        </div>

        {/* Main Player */}
        <div className="container-wide pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Episode Art and Info */}
              <div className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                  {/* Episode Artwork */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 lg:w-80 lg:h-80 mx-auto lg:mx-0 relative rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={getThumbnailUrl(episode.thumbnail_path)}
                        alt={episode.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 256px, 320px"
                        priority
                      />
                    </div>
                  </div>

                  {/* Episode Details */}
                  <div className="flex-1">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
                        {episode.title}
                      </h1>
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {episode.description}
                      </p>
                      
                      {/* Episode Meta */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 mb-8">
                        {episode.episode_number && (
                          <span>Episode {episode.episode_number}</span>
                        )}
                        {episode.season && (
                          <span>Season {episode.season}</span>
                        )}
                        <span>{new Date(episode.published_at).toLocaleDateString()}</span>
                        {duration > 0 && (
                          <span>{formatTime(duration)}</span>
                        )}
                      </div>


                      {/* Quiz Status */}
                      {episode.quiz_id && (
                        <div className="mb-8">
                          {quizCompleted ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                  <Check size={20} className="text-green-600" />
                                </div>
                                <span className="text-lg font-semibold text-green-700">
                                  {quizPassed ? 'Complete' : 'Incomplete'}
                                </span>
                              </div>
                              {quizPassed && (
                                <button
                                  onClick={downloadCertificate}
                                  className="btn-secondary flex items-center space-x-2"
                                >
                                  <div className="flex items-center justify-center w-5 h-5">
                                    <Download size={16} />
                                  </div>
                                  <span>Download Certificate</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowQuiz(true)}
                              className="btn-primary"
                            >
                              Take Quiz
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Player Controls */}
              <div className="bg-gray-50 px-8 lg:px-12 py-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      onMouseDown={handleScrubberMouseDown}
                      onMouseUp={handleScrubberMouseUp}
                      onTouchStart={handleScrubberMouseDown}
                      onTouchEnd={handleScrubberMouseUp}
                      className="audio-player-progress w-full cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${progressPercentage}%, rgb(228, 228, 231) ${progressPercentage}%, rgb(228, 228, 231) 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={() => skipTime(-15)}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <SkipBack size={20} />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    disabled={!currentAudioSrc}
                    className="p-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  <button
                    onClick={() => skipTime(15)}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between mt-6">
                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button onClick={toggleMute} className="p-2 text-gray-600 hover:text-gray-800">
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 accent-primary-600"
                    />
                  </div>

                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                    >
                      <Settings size={20} />
                      <span className="text-sm">{playbackRate}x</span>
                    </button>
                    
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-2">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                              playbackRate === rate ? 'bg-primary-50 text-primary-600' : ''
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} src={currentAudioSrc} preload="metadata" />

        {/* Quiz Modal */}
        {showQuiz && episode.quiz_id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Episode Quiz</h2>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <Quiz quizId={episode.quiz_id} episodeTitle={episode.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PodcastPlayer;