import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Quiz from '@/components/Quiz';
import { supabase } from '@/lib/supabase';
import { useQuizCompletion } from '@/hooks/useQuizCompletion';
import { useUserContentProgress } from '@/hooks/useUserContentProgress';
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
  const { isQuizCompleted, isQuizPassedWithThreshold, getQuizPercentage, refreshData } = useQuizCompletion();
  
  // User content progress state (database-backed)
  const {
    hasListened,
    quizCompleted: progressQuizCompleted,
    reportDownloaded,
    certificateDownloaded,
    updateListenProgress,
    markQuizCompleted,
    markReportDownloaded,
    markCertificateDownloaded,
    loading: progressLoading
  } = useUserContentProgress(episode?.content_id);
  
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
      if (!isScrubbing) {
        const currentTime = audio.currentTime || 0;
        setCurrentTime(currentTime);
        
        // Update listen progress in database
        const listenedPercentage = duration ? (currentTime / duration) * 100 : 0;
        
        // Update progress every 10% milestone to avoid too many database calls
        const currentMilestone = Math.floor(listenedPercentage / 10);
        const previousMilestone = Math.floor(progressPercentage / 10);
        
        if (currentMilestone > previousMilestone) {
          updateListenProgress(listenedPercentage, hasListened);
        }
      }
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
  }, [currentAudioSrc, isScrubbing, duration, progressPercentage, hasListened, updateListenProgress]);

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
      
      // Mark as listened as soon as play button is clicked
      if (!hasListened) {
        updateListenProgress(progressPercentage, true);
        console.log('Podcast marked as listened (play button clicked)');
      }
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

  const downloadCertificate = async () => {
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
    
    // Mark certificate as downloaded in database
    await markCertificateDownloaded();
    console.log('Certificate downloaded and marked in database');
  };

  const downloadReport = async () => {
    if (!episode) return;
    
    // Create a temporary link to download the dummy PDF
    const link = document.createElement('a');
    link.href = '/documents/cpd-report-template.pdf';
    link.download = `CPD-Report-${episode.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mark report as downloaded in database
    await markReportDownloaded();
    console.log('Report downloaded and marked in database');
  };

  // Memoize quiz completion callback to prevent infinite re-renders
  const handleQuizComplete = useCallback(async () => {
    console.log('Quiz completed, refreshing data...');
    await refreshData();
    await markQuizCompleted();
  }, [refreshData, markQuizCompleted]);

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

                      {/* Learning Progress Breadcrumbs */}
                      <div className="flex items-center gap-1 mb-2 text-xs">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          hasListened ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6m-6 4h6m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Listen to podcast</span>
                          {hasListened && <Check size={10} />}
                        </div>
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          reportDownloaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Download Report</span>
                          {reportDownloaded && <Check size={10} />}
                        </div>
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          progressQuizCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="font-medium">Take Quiz</span>
                          {progressQuizCompleted && <Check size={10} />}
                        </div>
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          certificateDownloaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Download certificate</span>
                          {certificateDownloaded && <Check size={10} />}
                        </div>
                      </div>

                      {/* CPD Context Indicators */}
                      {quizPassed && (
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2 text-sm bg-green-100 px-3 py-2 rounded-lg border border-green-200 shadow-sm">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-800 font-semibold">1 CPD hour completed!</span>
                          </div>
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
                          className="audio-player-progress w-full cursor-pointer h-1 transition-all duration-300"
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
                      <div className="flex flex-col gap-3 mt-4">
                        {/* 1. Download Report */}
                        <button
                          onClick={downloadReport}
                          className="w-full px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <FileText size={18} />
                          {reportDownloaded ? 'Download Report ✓' : 'Download Report'}
                        </button>
                        
                        {/* 2. Start Quiz */}
                        <button
                          onClick={() => setShowQuiz(true)}
                          disabled={!hasListened || !reportDownloaded}
                          className={`w-full px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                            hasListened && reportDownloaded
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:shadow-xl transform hover:scale-[1.02]' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <HelpCircle size={18} />
                          {!hasListened ? 'Listen to Episode First' : 
                           !reportDownloaded ? 'Download Report First' :
                           (quizCompleted ? 'Take CPD Quiz' : 'Start CPD Quiz')}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        {/* 3. Download Certificate */}
                        <button
                          onClick={downloadCertificate}
                          disabled={!quizPassed || !reportDownloaded}
                          className={`w-full px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                            quizPassed && reportDownloaded
                              ? 'bg-green-100 hover:bg-green-200 text-green-700 hover:shadow-xl transform hover:scale-[1.02]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Download size={18} />
                          {certificateDownloaded ? 'Certificate Downloaded ✓' : !quizPassed ? 'Get Certificate (pass quiz first)' : !reportDownloaded ? 'Download Report First' : 'Get Certificate'}
                        </button>
                        
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
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">CPD Assessment Quiz</h2>
                </div>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <Quiz 
                  quizId={episode.content_id} 
                  episodeTitle={episode.title} 
                  episodeDuration={episode.duration}
                  onComplete={handleQuizComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PodcastPlayer;