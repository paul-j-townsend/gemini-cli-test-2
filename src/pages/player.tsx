import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Quiz from '@/components/Quiz';
import { supabase } from '@/lib/supabase';
import { useQuizCompletion } from '@/hooks/useQuizCompletion';
import { podcastService, PodcastEpisode } from '@/services/podcastService';
import { ReportGenerator } from '@/services/reportGenerator';
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
  AlertCircle,
  FileText,
  HelpCircle
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
  
  const quizCompleted = episode?.content_id ? isQuizCompleted(episode.content_id) : false;
  const quizPassed = episode?.content_id ? isQuizPassedWithThreshold(episode.content_id, 70) : false;
  const quizPercentage = episode?.content_id ? getQuizPercentage(episode.content_id) : 0;
  
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
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudioSrc, isScrubbing]);

  // Update audio properties when state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  // Play/pause handlers
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentAudioSrc) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleScrubberMouseDown = () => setIsScrubbing(true);
  const handleScrubberMouseUp = () => setIsScrubbing(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
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
    if (!quizPassed || !episode) return;
    
    const reportData = {
      episode: {
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        published_at: episode.published_at,
        category: episode.category,
        episode_number: episode.episode_number,
        season: episode.season
      },
      quiz: {
        completed: quizCompleted,
        passed: quizPassed,
        percentage: quizPercentage
      }
    };
    
    ReportGenerator.generateCertificate(reportData);
  };

  const downloadReport = () => {
    if (!episode) return;
    
    const reportData = {
      episode: {
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        published_at: episode.published_at,
        category: episode.category,
        episode_number: episode.episode_number,
        season: episode.season
      },
      quiz: {
        completed: quizCompleted,
        passed: quizPassed,
        percentage: quizPercentage
      }
    };
    
    ReportGenerator.downloadTextReport(reportData);
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

      <div className="bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        {/* Header */}
        <div className="container-wide py-1">
          <button
            onClick={() => router.push('/podcasts')}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Episodes</span>
          </button>
        </div>

        {/* Main Player - Ultra Compact */}
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Single Unified Content Area */}
              <div className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Episode Artwork */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 relative rounded overflow-hidden">
                      <Image
                        src={getThumbnailUrl(episode.thumbnail_path)}
                        alt={episode.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                        priority
                      />
                    </div>
                  </div>

                  {/* Episode Details & All Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    {/* Episode Info - Very Compact */}
                    <div className="mb-3">
                      <h1 className="text-lg font-bold text-green-700 mb-1 line-clamp-1">
                        {episode.title}
                      </h1>
                      <p className="text-gray-600 text-sm mb-2">
                        {episode.description}
                      </p>

                      {/* Quiz Status - Compact */}
                      {episode.content_id && quizCompleted && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                            <Check size={8} className="text-green-600" />
                          </div>
                          <span className="text-xs font-medium text-green-700">
                            Quiz {quizPassed ? 'Passed' : 'Failed'} - {quizPercentage}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Audio Controls - All in Compact Area */}
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div>
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
                          className="audio-player-progress w-full cursor-pointer h-1"
                          style={{
                            background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${progressPercentage}%, rgb(228, 228, 231) ${progressPercentage}%, rgb(228, 228, 231) 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* All Controls in Single Compact Row */}
                      <div className="flex items-center justify-between">
                        {/* Volume - Compact */}
                        <div className="flex items-center gap-1">
                          <button onClick={toggleMute} className="p-1 text-gray-600 hover:text-gray-800">
                            {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-10 accent-primary-600"
                          />
                        </div>

                        {/* Main Play Controls - Centered */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => skipTime(-15)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <SkipBack size={14} />
                          </button>

                          <button
                            onClick={handlePlayPause}
                            disabled={!currentAudioSrc}
                            className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50"
                          >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </button>

                          <button
                            onClick={() => skipTime(15)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <SkipForward size={14} />
                          </button>
                        </div>

                        {/* Speed Control - Compact */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                          >
                            <Settings size={14} />
                            <span className="text-xs">{playbackRate}x</span>
                          </button>
                          
                          {showSettings && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white rounded shadow-lg border p-1">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => handlePlaybackRateChange(rate)}
                                  className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
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

                    {/* Quiz & Report Buttons - Below Audio Controls */}
                    {episode.content_id && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowQuiz(true)}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg flex items-center gap-2"
                        >
                          <HelpCircle size={16} />
                          {quizCompleted ? 'Retake Quiz' : 'Take Quiz'}
                        </button>
                        
                        <button
                          onClick={downloadReport}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg flex items-center gap-2"
                        >
                          <FileText size={16} />
                          Download Report
                        </button>
                        
                        {quizPassed && (
                          <button
                            onClick={downloadCertificate}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download Certificate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        {currentAudioSrc && <audio ref={audioRef} src={currentAudioSrc} preload="metadata" />}

        {/* Quiz Modal */}
        {showQuiz && episode?.content_id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">CPD Assessment Quiz - {episode.title}</h2>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <Quiz quizId={episode.content_id} episodeTitle={episode.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PodcastPlayer;