import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_src: string | null;
  full_audio_src: string | null;
  image_url: string | null;
  thumbnail_path: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  episode_number?: number;
  season?: number;
  duration?: number;
  slug?: string;
  is_published?: boolean;
  category?: string; // Added category field
  content_id: string; // Changed from quiz_id to content_id
  quiz?: {
    id: string;
    title: string;
    description: string;
    category: string[];
    total_questions: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    questions: {
      id: string;
      question_number: number;
      question_text: string;
      explanation: string;
      rationale: string;
      learning_outcome: string;
      answers: {
        id: string;
        answer_letter: string;
        answer_text: string;
        is_correct: boolean;
      }[];
    }[];
  };
}

export interface SeriesGroup {
  id: string | null;
  name: string;
  description: string;
  slug: string | null;
  thumbnail_path: string | null;
  display_order: number;
  episodes: PodcastEpisode[];
  episodeCount: number;
}

export interface PodcastCreateData {
  title: string;
  description?: string;
  audio_src?: string;
  full_audio_src?: string;
  image_url?: string;
  thumbnail_path?: string;
  published_at?: string;
  episode_number?: number;
  season?: number;
  duration?: number;
  slug?: string;
  is_published?: boolean;
  content_id: string; // Changed from quiz_id to content_id
}

export interface PodcastUpdateData extends Partial<PodcastCreateData> {
  id: string;
}

class PodcastService {
  private async fetchContentFromAPI(endpoint: string): Promise<any> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private mapContentToEpisode(content: any): PodcastEpisode {
    if (!content) {
      throw new Error('Content data is required');
    }
    const episode = {
      id: content.id,
      title: content.title,
      description: content.description,
      audio_src: content.audio_src,
      full_audio_src: content.full_audio_src,
      image_url: content.image_url,
      thumbnail_path: content.thumbnail_path,
      published_at: content.published_at,
      created_at: content.created_at,
      updated_at: content.updated_at,
      episode_number: content.episode_number,
      season: content.season,
      duration: content.duration,
      slug: content.slug,
      is_published: content.is_published,
      category: content.category || 'General', // Map category field
      content_id: content.id, // Map content id to content_id
      quiz: content.questions && content.questions.length > 0 ? {
        id: content.id,
        title: content.title,
        description: content.description,
        category: content.category || [],
        total_questions: content.questions?.length || 0,
        is_active: content.is_published || false,
        created_at: content.created_at,
        updated_at: content.updated_at,
        questions: content.questions?.map((q: any) => ({
          id: q.id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          rationale: q.rationale,
          learning_outcome: q.learning_outcome,
          answers: q.answers || []
        })) || []
      } : undefined
    };
    
    // Preserve series data for grouping
    (episode as any).series_id = content.series_id;
    (episode as any).series = content.series;
    
    return episode;
  }

  async getAllEpisodes(): Promise<PodcastEpisode[]> {
    try {
      const data = await this.fetchContentFromAPI('/api/admin/content');
      return (data || []).map(this.mapContentToEpisode);
    } catch (error) {
      console.error('Error fetching all episodes:', error);
      throw new Error('Failed to fetch episodes');
    }
  }

  async getPublishedEpisodes(limit?: number): Promise<PodcastEpisode[]> {
    try {
      // Direct database access for server-side calls
      let query = supabaseAdmin
        .from('vsk_content')
        .select(`
          *,
          series:vsk_series(
            id,
            name,
            slug,
            description,
            thumbnail_path,
            display_order
          )
        `)
        .eq('is_published', true)
        .order('episode_number', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      const episodes = (data || [])
        .filter((content: any) => content.published_at)
        .map(this.mapContentToEpisode);
      return episodes;
    } catch (error) {
      console.error('Error fetching published episodes:', error);
      throw new Error('Failed to fetch published episodes');
    }
  }

  async getEpisodeById(id: string): Promise<PodcastEpisode | null> {
    try {
      const data = await this.fetchContentFromAPI(`/api/admin/content?id=${id}`);
      if (!data) {
        return null;
      }
      return this.mapContentToEpisode(data);
    } catch (error) {
      console.error('Error fetching episode by ID:', error);
      return null;
    }
  }

  async getEpisodeByContentId(contentId: string): Promise<PodcastEpisode | null> {
    return this.getEpisodeById(contentId);
  }

  async createEpisode(data: PodcastCreateData): Promise<PodcastEpisode> {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          audio_src: data.audio_src,
          full_audio_src: data.full_audio_src,
          image_url: data.image_url,
          thumbnail_path: data.thumbnail_path,
          published_at: data.published_at,
          episode_number: data.episode_number,
          season: data.season,
          duration: data.duration,
          slug: data.slug,
          is_published: data.is_published || false,
          content_type: 'podcast',
          category: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create episode');
      }

      const episode = await response.json();
      return this.mapContentToEpisode(episode);
    } catch (error) {
      console.error('Error creating episode:', error);
      throw new Error('Failed to create episode');
    }
  }

  async updateEpisode(data: PodcastUpdateData): Promise<PodcastEpisode | null> {
    const { id, ...updateData } = data;
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: updateData.title,
          description: updateData.description,
          audio_src: updateData.audio_src,
          full_audio_src: updateData.full_audio_src,
          image_url: updateData.image_url,
          thumbnail_path: updateData.thumbnail_path,
          published_at: updateData.published_at,
          episode_number: updateData.episode_number,
          season: updateData.season,
          duration: updateData.duration,
          slug: updateData.slug,
          is_published: updateData.is_published,
          content_type: 'podcast'
        })
      });

      if (!response.ok) {
        return null;
      }

      const episode = await response.json();
      return this.mapContentToEpisode(episode);
    } catch (error) {
      console.error('Error updating episode:', error);
      return null;
    }
  }

  async deleteEpisode(id: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting episode:', error);
      return false;
    }
  }

  // Series-based methods
  private getSeriesDescription(seriesName: string): string {
    const descriptions: Record<string, string> = {
      'General': 'Comprehensive veterinary education covering essential topics for professional development.',
      'Zoonoses': 'Understanding diseases that can be transmitted between animals and humans.',
      'Surgery': 'Advanced surgical techniques and procedures for veterinary professionals.',
      'Emergency Medicine': 'Critical care and emergency protocols for veterinary practice.',
      'Nutrition': 'Animal nutrition science and dietary management strategies.',
      'Behavior': 'Animal behavior, psychology, and behavioral medicine approaches.',
      'Radiology': 'Diagnostic imaging and interpretation for veterinary professionals.',
      'Pharmacology': 'Veterinary drug therapy and pharmaceutical management.',
      'Pathology': 'Disease diagnosis and pathological processes in animals.',
      'Reproduction': 'Animal reproduction, breeding, and reproductive health management.'
    };
    return descriptions[seriesName] || 'Expert insights and educational content for veterinary professionals.';
  }

  async getEpisodesBySeries(limit?: number): Promise<SeriesGroup[]> {
    try {
      const episodes = await this.getPublishedEpisodes(limit);
      
      // Group episodes by series (including episodes without a series)
      const groupedBySeries = episodes.reduce((acc, episode) => {
        const seriesId = (episode as any).series_id || 'no-series';
        const seriesData = (episode as any).series;
        
        if (!acc[seriesId]) {
          acc[seriesId] = {
            seriesData,
            episodes: []
          };
        }
        acc[seriesId].episodes.push(episode);
        return acc;
      }, {} as Record<string, { seriesData: any; episodes: PodcastEpisode[] }>);

      // Convert to SeriesGroup array and sort by display_order
      const seriesGroups = Object.entries(groupedBySeries).map(([seriesId, { seriesData, episodes }]) => ({
        id: seriesId === 'no-series' ? null : seriesId,
        name: seriesData?.name || 'Standalone Episodes',
        description: seriesData?.description || 'Episodes not assigned to a series',
        slug: seriesData?.slug || null,
        thumbnail_path: seriesData?.thumbnail_path || null,
        display_order: seriesData?.display_order || 999,
        episodes: episodes.sort((a, b) => {
          // Sort by episode number (desc) then by published date (desc)
          if (a.episode_number && b.episode_number) {
            return b.episode_number - a.episode_number;
          }
          if (a.published_at && b.published_at) {
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          }
          return 0;
        }),
        episodeCount: episodes.length
      }));

      // Sort series by display_order
      return seriesGroups.sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error fetching episodes by series:', error);
      throw new Error('Failed to fetch episodes by series');
    }
  }

  async getEpisodesBySeriesName(seriesName: string, limit?: number): Promise<PodcastEpisode[]> {
    try {
      const episodes = await this.getPublishedEpisodes();
      return episodes
        .filter(episode => {
          const seriesData = (episode as any).series;
          if (seriesName === 'Standalone Episodes') {
            return !seriesData;
          }
          return seriesData?.name === seriesName;
        })
        .sort((a, b) => {
          if (a.episode_number && b.episode_number) {
            return b.episode_number - a.episode_number;
          }
          if (a.published_at && b.published_at) {
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          }
          return 0;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching episodes by series name:', error);
      throw new Error('Failed to fetch episodes by series name');
    }
  }

  // Client-side methods for frontend usage (use API calls)
  async getPublishedEpisodesClient(limit?: number): Promise<PodcastEpisode[]> {
    try {
      const query = new URLSearchParams();
      if (limit) query.append('limit', limit.toString());
      query.append('published_only', 'true');
      
      const data = await this.fetchContentFromAPI(`/api/admin/content?${query}`);
      return (data || [])
        .filter((content: any) => content.published_at)
        .map(this.mapContentToEpisode);
    } catch (error) {
      console.error('Error fetching published episodes (client):', error);
      throw new Error('Failed to fetch published episodes');
    }
  }

  async getEpisodeByIdClient(id: string): Promise<PodcastEpisode | null> {
    return this.getEpisodeById(id);
  }

  async getEpisodesBySeriesClient(limit?: number): Promise<SeriesGroup[]> {
    try {
      const episodes = await this.getPublishedEpisodesClient(limit);
      
      // Group episodes by series (including episodes without a series)
      const groupedBySeries = episodes.reduce((acc, episode) => {
        const seriesId = (episode as any).series_id || 'no-series';
        const seriesData = (episode as any).series;
        
        if (!acc[seriesId]) {
          acc[seriesId] = {
            seriesData,
            episodes: []
          };
        }
        acc[seriesId].episodes.push(episode);
        return acc;
      }, {} as Record<string, { seriesData: any; episodes: PodcastEpisode[] }>);

      // Convert to SeriesGroup array and sort by display_order
      const seriesGroups = Object.entries(groupedBySeries).map(([seriesId, { seriesData, episodes }]) => ({
        id: seriesId === 'no-series' ? null : seriesId,
        name: seriesData?.name || 'Standalone Episodes',
        description: seriesData?.description || 'Episodes not assigned to a series',
        slug: seriesData?.slug || null,
        thumbnail_path: seriesData?.thumbnail_path || null,
        display_order: seriesData?.display_order || 999,
        episodes: episodes.sort((a, b) => {
          // Sort by episode number (desc) then by published date (desc)
          if (a.episode_number && b.episode_number) {
            return b.episode_number - a.episode_number;
          }
          if (a.published_at && b.published_at) {
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          }
          return 0;
        }),
        episodeCount: episodes.length
      }));

      // Sort series by display_order
      return seriesGroups.sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error fetching episodes by series (client):', error);
      throw new Error('Failed to fetch episodes by series');
    }
  }
}

export const podcastService = new PodcastService();
export default podcastService;