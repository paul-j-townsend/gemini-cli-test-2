import { 
  PodcastEpisode, 
  Quiz
} from '@/types/database';

// Simple validation helpers for unified content system
function hasRequiredQuizId(data: any): boolean {
  return data && (data.quiz_id || data.id);
}

function isValidPodcastEpisode(data: any): boolean {
  return data && data.title && data.id;
}

function isValidQuiz(data: any): boolean {
  return data && data.title && data.id;
}

function validatePodcastQuizRelationship(podcast: any, quiz: any): { isValid: boolean; error?: string } {
  if (!podcast || !quiz) {
    return { isValid: false, error: 'Missing podcast or quiz data' };
  }
  
  const isValid = podcast.quiz_id === quiz.id || podcast.id === quiz.content_id;
  return { 
    isValid, 
    error: isValid ? undefined : 'Podcast and quiz IDs do not match' 
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export function validateEpisodeData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if quiz_id is provided and not empty
  if (!hasRequiredQuizId(data)) {
    errors.push('Quiz ID is required for each podcast episode');
  }

  // Check if episode data is valid
  if (!isValidPodcastEpisode(data)) {
    errors.push('Invalid podcast episode data structure');
  }

  // Additional validation for required fields
  if (!data.title || data.title.trim() === '') {
    errors.push('Episode title is required');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Episode description is required');
  }

  if (!data.audio_src && !data.audio_url) {
    errors.push('Audio source is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateQuizData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if quiz data is valid
  if (!isValidQuiz(data)) {
    errors.push('Invalid quiz data structure');
  }

  // Additional validation for required fields
  if (!data.title || data.title.trim() === '') {
    errors.push('Quiz title is required');
  }

  if (!data.category || data.category.trim() === '') {
    errors.push('Quiz category is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validatePodcastQuizPair(
  episode: PodcastEpisode, 
  quiz: Quiz
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Use the built-in validation function
  const relationshipValidation = validatePodcastQuizRelationship(episode, quiz);
  
  if (!relationshipValidation.isValid) {
    errors.push(relationshipValidation.error || 'Invalid podcast-quiz relationship');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateUniqueQuizAssignment(
  episodes: PodcastEpisode[],
  newEpisode: PodcastEpisode
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // In unified content system, each content item is unique by design
  // No need to check for quiz duplication since content is already unified

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateBulkEpisodeData(episodes: PodcastEpisode[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quizIds = new Set<string>();

  for (const episode of episodes) {
    // Validate individual episode
    const episodeValidation = validateEpisodeData(episode);
    if (!episodeValidation.isValid) {
      errors.push(`Episode "${episode.title}": ${episodeValidation.errors.join(', ')}`);
    }

    // In unified content system, no duplicate quiz assignments possible
    // Each content item is inherently unique
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export const relationshipValidationSchema = {
  episodeCreation: {
    requiredFields: ['title', 'description', 'quiz_id'],
    validations: [
      validateEpisodeData,
      (data: any, context?: { existingEpisodes: PodcastEpisode[] }) => {
        if (context?.existingEpisodes) {
          return validateUniqueQuizAssignment(context.existingEpisodes, data);
        }
        return { isValid: true, errors: [] };
      }
    ]
  },
  quizCreation: {
    requiredFields: ['title', 'category'],
    validations: [validateQuizData]
  },
  relationshipUpdate: {
    validations: [validatePodcastQuizPair]
  }
};