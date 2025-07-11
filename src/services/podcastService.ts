import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';
import { 
  transformToPodcastQuizEntity, 
  PODCAST_QUIZ_QUERY_FRAGMENT,
  UnifiedPodcastQuizEntity,
  isCompleteUnifiedEntity,
  getEntitySummary
} from '@/utils/podcastQuizTransforms';

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
  quiz_id: string;
  // Always include complete quiz data as part of unified entity
  quiz?: {
    id: string;
    title: string;
    description: string;
    category: string;
    pass_percentage: number;
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
  quiz_id: string;
}

export interface PodcastUpdateData extends Partial<PodcastCreateData> {
  id: string;
}

class PodcastService {
  private getCompleteEpisodeQuery() {
    return PODCAST_QUIZ_QUERY_FRAGMENT;
  }

  private mapEpisodeData(episode: any): PodcastEpisode {
    const unifiedEntity = transformToPodcastQuizEntity(episode);
    
    // Log incomplete entities for debugging
    if (!isCompleteUnifiedEntity(unifiedEntity)) {
      console.warn('Incomplete unified entity detected:', getEntitySummary(unifiedEntity));
    }
    
    return {
      id: unifiedEntity.id,
      title: unifiedEntity.title,
      description: unifiedEntity.description,
      audio_src: unifiedEntity.audio_src,
      full_audio_src: unifiedEntity.full_audio_src,
      image_url: unifiedEntity.image_url,
      thumbnail_path: unifiedEntity.thumbnail_path,
      published_at: unifiedEntity.published_at,
      created_at: unifiedEntity.created_at,
      updated_at: unifiedEntity.updated_at,
      episode_number: unifiedEntity.episode_number,
      season: unifiedEntity.season,
      duration: unifiedEntity.duration,
      slug: unifiedEntity.slug,
      is_published: unifiedEntity.is_published,
      quiz_id: unifiedEntity.quiz_id,
      quiz: unifiedEntity.quiz
    };
  }

  async getAllEpisodes(): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all episodes:', error);
      throw new Error('Failed to fetch episodes');
    }

    return (data || []).map(this.mapEpisodeData);
  }

  async getPublishedEpisodes(limit?: number): Promise<PodcastEpisode[]> {
    let query = supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching published episodes:', error);
      throw new Error('Failed to fetch published episodes');
    }

    return (data || []).map(this.mapEpisodeData);
  }

  async getEpisodeById(id: string): Promise<PodcastEpisode | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching episode by ID:', error);
      throw new Error('Failed to fetch episode');
    }

    return this.mapEpisodeData(data);
  }

  async getEpisodeByQuizId(quizId: string): Promise<PodcastEpisode | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .eq('quiz_id', quizId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching episode by quiz ID:', error);
      throw new Error('Failed to fetch episode by quiz ID');
    }

    return this.mapEpisodeData(data);
  }

  async createEpisode(data: PodcastCreateData): Promise<PodcastEpisode> {
    const { data: episode, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .insert([{
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
        quiz_id: data.quiz_id
      }])
      .select(this.getCompleteEpisodeQuery())
      .single();

    if (error) {
      console.error('Error creating episode:', error);
      throw new Error('Failed to create episode');
    }

    return this.mapEpisodeData(episode);
  }

  async updateEpisode(data: PodcastUpdateData): Promise<PodcastEpisode | null> {
    const { id, ...updateData } = data;
    
    const { data: episode, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update({
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
        quiz_id: updateData.quiz_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(this.getCompleteEpisodeQuery())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error updating episode:', error);
      throw new Error('Failed to update episode');
    }

    return this.mapEpisodeData(episode);
  }

  async deleteEpisode(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting episode:', error);
      return false;
    }

    return true;
  }

  // Client-side method for frontend usage
  async getPublishedEpisodesClient(limit?: number): Promise<PodcastEpisode[]> {
    let query = supabase
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching published episodes (client):', error);
      throw new Error('Failed to fetch published episodes');
    }

    return (data || []).map(this.mapEpisodeData);
  }

  async getEpisodeByIdClient(id: string): Promise<PodcastEpisode | null> {
    const { data, error } = await supabase
      .from('vsk_podcast_episodes')
      .select(this.getCompleteEpisodeQuery())
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching episode by ID (client):', error);
      throw new Error('Failed to fetch episode');
    }

    return this.mapEpisodeData(data);
  }
}

export const podcastService = new PodcastService();
export default podcastService;