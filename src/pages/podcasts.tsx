import Head from 'next/head';
import { useState, useEffect } from 'react';
import MasonryEpisodeCard from '@/components/MasonryEpisodeCard';
import Layout from '@/components/Layout';
import { podcastService, SeriesGroup as SeriesGroupType, PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface Episode extends PodcastEpisode {
  seriesName: string;
}

const Podcasts = () => {
  const [seriesData, setSeriesData] = useState<SeriesGroupType[]>([]);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color palette for series badges
  const seriesColors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
  ];

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const getDefaultThumbnailUrl = (): string => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl('thumbnails/1753642620645-zoonoses-s1e2.png');
    return data.publicUrl;
  };

  const getThumbnailUrl = (thumbnailPath: string): string => {
    if (!thumbnailPath) {
      return getDefaultThumbnailUrl();
    }
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(thumbnailPath);
    return data.publicUrl;
  };

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const seriesGroups = await podcastService.getEpisodesBySeriesClient();
      
      // Flatten all episodes into a single array
      const flatEpisodes = seriesGroups.flatMap(series => 
        series.episodes.map(episode => ({
          ...episode,
          seriesName: series.name
        }))
      );
      
      // Sort by published date (newest first)
      const sortedEpisodes = flatEpisodes.sort((a, b) => {
        if (a.published_at && b.published_at) {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        }
        return 0;
      });
      
      setSeriesData(seriesGroups);
      setAllEpisodes(sortedEpisodes);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setError('Failed to load episodes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get series color by index
  const getSeriesColor = (seriesName: string) => {
    const index = seriesData.findIndex(series => series.name === seriesName);
    return seriesColors[index % seriesColors.length];
  };

  // Group episodes by series for "All Series" view
  const groupedEpisodes = selectedSeriesFilter === 'all' 
    ? seriesData.map(series => ({
        ...series,
        color: getSeriesColor(series.name),
        episodes: series.episodes.map(episode => ({
          ...episode,
          seriesName: series.name
        }))
      }))
    : [];

  // Filter episodes based on selected series
  const filteredEpisodes = selectedSeriesFilter === 'all' 
    ? [] // We'll use groupedEpisodes instead
    : allEpisodes.filter(episode => episode.seriesName === selectedSeriesFilter);

  return (
    <Layout>
      <Head>
        <title>Podcasts - Vet Sidekick</title>
        <meta name="description" content="Expert veterinary insights and educational podcasts for professionals" />
      </Head>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-neutral-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Expert <span className="text-gradient-primary">Veterinary</span> Podcasts
        </h1>

            <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Stay ahead with cutting-edge insights, expert interviews and practical guidance 
              from leading veterinary professionals. Enhance your practice with evidence-based content.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Expert-Led Content</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Updated Weekly</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">CPD Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary-500 to-primary-600 animate-fade-in-up">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">
                {seriesData.reduce((total, series) => total + series.episodeCount, 0)}+
              </div>
              <div className="text-primary-100">Expert Episodes</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Active Listeners</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '600ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Masonry Section */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Latest Episodes
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of veterinary education episodes 
              from all series in one continuous feed.
            </p>
          </div>

          {/* Series Filter */}
          {seriesData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <button
                onClick={() => setSelectedSeriesFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSeriesFilter === 'all'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All Series ({allEpisodes.length})
              </button>
              {seriesData.map(series => (
                <button
                  key={series.name}
                  onClick={() => setSelectedSeriesFilter(series.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedSeriesFilter === series.name
                      ? 'text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  style={selectedSeriesFilter === series.name ? 
                    { backgroundColor: getSeriesColor(series.name) } : 
                    {}
                  }
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: selectedSeriesFilter === series.name 
                        ? 'white' 
                        : getSeriesColor(series.name) 
                    }}
                  />
                  {series.name} ({series.episodeCount})
                </button>
              ))}
            </div>
          )}

          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600 mt-4">Loading episodes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchEpisodes}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : selectedSeriesFilter === 'all' ? (
              // Grouped view for "All Series"
              <div className="space-y-12">
                {groupedEpisodes.map((series) => (
                  <div key={series.name} className="animate-fade-in-up">
                    {/* Series Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: series.color }}
                        />
                        <h3 className="text-2xl font-bold text-neutral-900">{series.name}</h3>
                        <div className="flex-1 h-px bg-neutral-200"></div>
                        <span className="text-sm text-neutral-500">{series.episodes.length} episode{series.episodes.length !== 1 ? 's' : ''}</span>
                      </div>
                      {series.description && (
                        <p className="text-neutral-600 text-sm leading-relaxed ml-8">
                          {series.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Series Episodes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {series.episodes.map((episode) => (
                        <MasonryEpisodeCard 
                          key={episode.id} 
                          episode={episode} 
                          seriesName={series.name}
                          seriesColor={series.color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600">No episodes available yet.</p>
                <p className="text-sm text-neutral-500 mt-2">Check back soon for new content.</p>
              </div>
            ) : (
              // Single series view
              <div className="animate-fade-in-up">
                {/* Selected Series Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getSeriesColor(selectedSeriesFilter) }}
                    />
                    <h3 className="text-2xl font-bold text-neutral-900">{selectedSeriesFilter}</h3>
                    <div className="flex-1 h-px bg-neutral-200"></div>
                    <span className="text-sm text-neutral-500">{filteredEpisodes.length} episode{filteredEpisodes.length !== 1 ? 's' : ''}</span>
                  </div>
                  {(() => {
                    const selectedSeries = seriesData.find(series => series.name === selectedSeriesFilter);
                    return selectedSeries?.description && (
                      <p className="text-neutral-600 text-sm leading-relaxed ml-8">
                        {selectedSeries.description}
                      </p>
                    );
                  })()}
                </div>
                
                {/* Series Episodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEpisodes.map((episode) => (
                    <MasonryEpisodeCard 
                      key={episode.id} 
                      episode={episode} 
                      seriesName={episode.seriesName}
                      seriesColor={getSeriesColor(episode.seriesName)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white animate-fade-in-up">
        <div className="container-wide text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Never Miss an Episode
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get notified when new episodes are released. 
            Join thousands of veterinary professionals staying informed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <button className="w-full sm:w-auto btn-primary">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-neutral-400 mt-4">
            Free forever. Unsubscribe anytime.
          </p>
    </div>
      </section>
    </Layout>
  );
};

export default Podcasts;
