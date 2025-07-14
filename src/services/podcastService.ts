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
    return {
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
      const query = new URLSearchParams();
      if (limit) query.append('limit', limit.toString());
      query.append('published_only', 'true');
      
      const data = await this.fetchContentFromAPI(`/api/admin/content?${query}`);
      return (data || [])
        .filter((content: any) => content.published_at)
        .map(this.mapContentToEpisode);
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

  // Client-side method for frontend usage
  async getPublishedEpisodesClient(limit?: number): Promise<PodcastEpisode[]> {
    return this.getPublishedEpisodes(limit);
  }

  async getEpisodeByIdClient(id: string): Promise<PodcastEpisode | null> {
    return this.getEpisodeById(id);
  }
}

export const podcastService = new PodcastService();
export default podcastService;