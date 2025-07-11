import React, { useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { podcastService, PodcastEpisode } from '@/services/podcastService';

interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string | null;
  thumbnail_path: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  episode_number?: number;
  season?: number;
  duration?: number;
  slug?: string;
  published?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
  show_notes?: string;
  transcript?: string;
  file_size?: number;
  meta_title?: string;
  meta_description?: string;
  full_audio_url?: string;
  quiz_id: string; // Required - enforces one-to-one relationship
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
  // Keep legacy format for backward compatibility
  vsk_quizzes?: {
    id: string;
    title: string;
    total_questions: number;
  };
}

interface QuizOption {
  id: string;
  title: string;
  question_number?: number;
}

interface PodcastManagementState {
  episodes: Episode[];
  quizzes: QuizOption[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  migrating: boolean;
}

interface PodcastManagementActions {
  fetchEpisodes: () => Promise<void>;
  fetchQuizzes: () => Promise<void>;
  createEpisode: (data: any) => Promise<Episode | null>;
  updateEpisode: (id: string, data: any) => Promise<Episode | null>;
  deleteEpisode: (id: string) => Promise<boolean>;
  clearError: () => void;
  handleMigration: () => Promise<void>;
  // Utility functions
  generateSlug: (title: string) => string;
  getNextEpisodeNumber: () => number;
  formatDuration: (seconds: number) => string;
  parseDuration: (timeString: string) => number;
  getThumbnailUrl: (thumbnailPath: string) => string | null;
}

export interface PodcastManagementHook extends PodcastManagementState, PodcastManagementActions {}

export const usePodcastManagement = (): PodcastManagementHook => {
  const [state, setState] = React.useState<PodcastManagementState>({
    episodes: [],
    quizzes: [],
    loading: true,
    error: null,
    saving: false,
    migrating: false,
  });

  const fetchEpisodes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use the podcast service to always get complete episode data with quiz info
      const episodes = await podcastService.getAllEpisodes();
      
      // Transform to match expected Episode interface
      const transformedEpisodes = episodes.map((episode: PodcastEpisode) => ({
        id: episode.id,
        title: episode.title,
        description: episode.description,
        audio_url: episode.audio_src || '',
        image_url: episode.image_url,
        thumbnail_path: episode.thumbnail_path || '',
        published_at: episode.published_at,
        created_at: episode.created_at,
        updated_at: episode.updated_at,
        episode_number: episode.episode_number,
        season: episode.season,
        duration: episode.duration,
        slug: episode.slug,
        published: episode.is_published,
        full_audio_url: episode.full_audio_src,
        quiz_id: episode.quiz_id,
        quiz: episode.quiz,
        // Keep legacy format for backward compatibility
        vsk_quizzes: episode.quiz ? {
          id: episode.quiz.id,
          title: episode.quiz.title,
          total_questions: episode.quiz.total_questions
        } : undefined
      }));
      
      setState(prev => ({
        ...prev,
        episodes: transformedEpisodes,
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load episodes',
      }));
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      
      const quizOptions = data.map((quiz: any) => ({
        id: quiz.id,
        title: `${quiz.title} (${quiz.questions?.length || 0} questions)`,
        question_number: null
      }));
      
      setState(prev => ({ ...prev, quizzes: quizOptions }));
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setState(prev => ({ ...prev, quizzes: [] }));
    }
  }, []);

  const createEpisode = useCallback(async (data: any): Promise<Episode | null> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      console.log('Creating episode with data:', data);
      
      const response = await fetch('/api/podcast-admin/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create episode: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const newEpisode = result.episode as Episode;
      
      setState(prev => ({
        ...prev,
        episodes: [newEpisode, ...prev.episodes],
        saving: false,
        error: null,
      }));

      return newEpisode;
    } catch (err) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to create episode',
      }));
      return null;
    }
  }, []);

  const updateEpisode = useCallback(async (id: string, data: any): Promise<Episode | null> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const response = await fetch(`/api/podcast-admin/episodes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update episode: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const updatedEpisode = result.episode as Episode;
      
      setState(prev => ({
        ...prev,
        episodes: prev.episodes.map(ep => 
          ep.id === id ? updatedEpisode : ep
        ),
        saving: false,
        error: null,
      }));

      return updatedEpisode;
    } catch (err) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to update episode',
      }));
      return null;
    }
  }, []);

  const deleteEpisode = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await fetch(`/api/podcast-admin/episodes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete episode');
      }

      setState(prev => ({
        ...prev,
        episodes: prev.episodes.filter(ep => ep.id !== id),
        error: null,
      }));

      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to delete episode',
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleMigration = useCallback(async () => {
    setState(prev => ({ ...prev, migrating: true, error: null }));

    try {
      const response = await fetch('/api/add-quiz-column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({ ...prev, error: `✅ ${result.message}` }));
        await fetchEpisodes();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: `Manual Migration Required: ${result.instruction}. Please run the following SQL: ${result.sql}`
        }));
      }
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: `Migration check failed: ${err.message}` 
      }));
    } finally {
      setState(prev => ({ ...prev, migrating: false }));
    }
  }, [fetchEpisodes]);

  // Helper functions for utilities
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const getNextEpisodeNumber = useCallback(() => {
    if (state.episodes.length === 0) return 1;
    const maxEpisodeNumber = Math.max(...state.episodes.map(ep => ep.episode_number || 0));
    return maxEpisodeNumber + 1;
  }, [state.episodes]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const parseDuration = useCallback((timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }, []);

  const getThumbnailUrl = useCallback((thumbnailPath: string) => {
    if (!thumbnailPath) return null;
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(thumbnailPath);
    return data.publicUrl;
  }, []);

  // Initialize data on mount
  React.useEffect(() => {
    fetchEpisodes();
    fetchQuizzes();
  }, [fetchEpisodes, fetchQuizzes]);

  return {
    ...state,
    fetchEpisodes,
    fetchQuizzes,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    clearError,
    handleMigration,
    // Utility functions
    generateSlug,
    getNextEpisodeNumber,
    formatDuration,
    parseDuration,
    getThumbnailUrl,
  };
};

export default usePodcastManagement;