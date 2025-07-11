import { 
  PodcastEpisode, 
  Quiz, 
  isValidPodcastEpisode, 
  isValidQuiz,
  validatePodcastQuizRelationship,
  hasRequiredQuizId 
} from '@/types/database';

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

  // Check if another episode already uses this quiz
  const existingEpisode = episodes.find(
    ep => ep.id !== newEpisode.id && ep.quiz_id === newEpisode.quiz_id
  );

  if (existingEpisode) {
    errors.push(
      `Quiz "${newEpisode.quiz_id}" is already assigned to episode "${existingEpisode.title}". Each quiz can only be assigned to one episode.`
    );
  }

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

    // Check for duplicate quiz assignments
    if (quizIds.has(episode.quiz_id)) {
      errors.push(`Duplicate quiz assignment found: Quiz "${episode.quiz_id}" is assigned to multiple episodes`);
    } else {
      quizIds.add(episode.quiz_id);
    }
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