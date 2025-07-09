import { ValidationSchema } from '@/hooks/useFormManagement';

export interface EpisodeFormData {
  title: string;
  description: string;
  audio_url: string;
  thumbnail_path: string;
  image_url?: string;
  published_at: string;
  episode_number: number;
  season: number;
  duration: number | string;
  slug: string;
  published: boolean;
  full_audio_url: string;
  quiz_id: string;
}

export const podcastValidationSchema: ValidationSchema<EpisodeFormData> = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
  },
  description: {
    maxLength: 2000,
  },
  episode_number: {
    required: true,
    min: 1,
    max: 999,
  },
  season: {
    required: true,
    min: 1,
    max: 50,
  },
  duration: {
    custom: (value: number | string) => {
      if (typeof value === 'string') {
        const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
        if (value !== '' && !timePattern.test(value)) {
          return 'Duration must be in MM:SS or HH:MM:SS format';
        }
      }
      return null;
    },
  },
  slug: {
    pattern: /^[a-z0-9-]+$/,
    custom: (value: string) => {
      if (value && (value.startsWith('-') || value.endsWith('-'))) {
        return 'Slug cannot start or end with a hyphen';
      }
      return null;
    },
  },
  published_at: {
    required: true,
  },
};

export const createInitialEpisodeData = (nextEpisodeNumber: number = 1): EpisodeFormData => ({
  title: '',
  description: '',
  audio_url: '',
  thumbnail_path: '',
  image_url: '',
  published_at: new Date().toISOString().slice(0, 16),
  episode_number: nextEpisodeNumber,
  season: 1,
  duration: '',
  slug: '',
  published: false,
  full_audio_url: '',
  quiz_id: ''
});

export const mapEpisodeToFormData = (episode: any): EpisodeFormData => ({
  title: episode.title,
  description: episode.description,
  audio_url: episode.audio_url,
  thumbnail_path: episode.thumbnail_path,
  image_url: episode.image_url || '',
  published_at: episode.published_at 
    ? new Date(episode.published_at).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16),
  episode_number: episode.episode_number || 1,
  season: episode.season || 1,
  duration: episode.duration || '',
  slug: episode.slug || '',
  published: episode.published || false,
  full_audio_url: episode.full_audio_url || '',
  quiz_id: episode.quiz_id || ''
});

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const parseDuration = (timeString: string): number => {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};