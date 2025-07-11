/**
 * Utility functions for transforming podcast-quiz unified entities
 * These functions handle the mapping between database structures and application interfaces
 */

export interface UnifiedPodcastQuizEntity {
  // Podcast Episode fields
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
  
  // Quiz relationship
  quiz_id: string;
  
  // Complete quiz data (always included)
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

export interface UnifiedQuizPodcastEntity {
  // Quiz fields
  id: string;
  title: string;
  description: string;
  category: string;
  pass_percentage: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Questions (always included)
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
  
  // Complete podcast episode data (always included)
  podcast_episode?: {
    id: string;
    title: string;
    description: string;
    audio_src: string;
    full_audio_src: string;
    published_at: string;
    is_published: boolean;
    episode_number?: number;
    season?: number;
    duration?: number;
    slug?: string;
    image_url?: string;
    thumbnail_path?: string;
  };
}

/**
 * Transform raw database result to unified podcast-quiz entity
 */
export function transformToPodcastQuizEntity(rawData: any): UnifiedPodcastQuizEntity {
  return {
    id: rawData.id,
    title: rawData.title,
    description: rawData.description,
    audio_src: rawData.audio_src,
    full_audio_src: rawData.full_audio_src,
    image_url: rawData.image_url,
    thumbnail_path: rawData.thumbnail_path,
    published_at: rawData.published_at,
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
    episode_number: rawData.episode_number,
    season: rawData.season,
    duration: rawData.duration,
    slug: rawData.slug,
    is_published: rawData.is_published,
    quiz_id: rawData.quiz_id,
    quiz: rawData.vsk_quizzes ? {
      id: rawData.vsk_quizzes.id,
      title: rawData.vsk_quizzes.title,
      description: rawData.vsk_quizzes.description,
      category: rawData.vsk_quizzes.category,
      pass_percentage: rawData.vsk_quizzes.pass_percentage,
      total_questions: rawData.vsk_quizzes.total_questions,
      is_active: rawData.vsk_quizzes.is_active,
      created_at: rawData.vsk_quizzes.created_at,
      updated_at: rawData.vsk_quizzes.updated_at,
      questions: rawData.vsk_quizzes.vsk_quiz_questions?.map((q: any) => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        explanation: q.explanation,
        rationale: q.rationale,
        learning_outcome: q.learning_outcome,
        answers: q.vsk_question_answers?.sort((a: any, b: any) => a.answer_letter.localeCompare(b.answer_letter)) || []
      })) || []
    } : undefined
  };
}

/**
 * Transform raw database result to unified quiz-podcast entity
 */
export function transformToQuizPodcastEntity(rawData: any): UnifiedQuizPodcastEntity {
  return {
    id: rawData.id,
    title: rawData.title,
    description: rawData.description,
    category: rawData.category,
    pass_percentage: rawData.pass_percentage,
    total_questions: rawData.total_questions,
    is_active: rawData.is_active,
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
    questions: rawData.vsk_quiz_questions?.map((q: any) => ({
      id: q.id,
      question_number: q.question_number,
      question_text: q.question_text,
      explanation: q.explanation,
      rationale: q.rationale,
      learning_outcome: q.learning_outcome,
      answers: q.vsk_question_answers?.sort((a: any, b: any) => a.answer_letter.localeCompare(b.answer_letter)) || []
    })) || [],
    podcast_episode: rawData.vsk_podcast_episodes ? {
      id: rawData.vsk_podcast_episodes.id,
      title: rawData.vsk_podcast_episodes.title,
      description: rawData.vsk_podcast_episodes.description,
      audio_src: rawData.vsk_podcast_episodes.audio_src,
      full_audio_src: rawData.vsk_podcast_episodes.full_audio_src,
      published_at: rawData.vsk_podcast_episodes.published_at,
      is_published: rawData.vsk_podcast_episodes.is_published,
      episode_number: rawData.vsk_podcast_episodes.episode_number,
      season: rawData.vsk_podcast_episodes.season,
      duration: rawData.vsk_podcast_episodes.duration,
      slug: rawData.vsk_podcast_episodes.slug,
      image_url: rawData.vsk_podcast_episodes.image_url,
      thumbnail_path: rawData.vsk_podcast_episodes.thumbnail_path
    } : undefined
  };
}

/**
 * Standard query fragment for fetching complete podcast-quiz entity
 */
export const PODCAST_QUIZ_QUERY_FRAGMENT = `
  *,
  vsk_quizzes (
    id,
    title,
    description,
    category,
    pass_percentage,
    total_questions,
    is_active,
    created_at,
    updated_at,
    vsk_quiz_questions (
      id,
      question_number,
      question_text,
      explanation,
      rationale,
      learning_outcome,
      vsk_question_answers (
        id,
        answer_letter,
        answer_text,
        is_correct
      )
    )
  )
`;

/**
 * Standard query fragment for fetching complete quiz-podcast entity
 */
export const QUIZ_PODCAST_QUERY_FRAGMENT = `
  *,
  vsk_quiz_questions (
    id,
    question_number,
    question_text,
    explanation,
    rationale,
    learning_outcome,
    vsk_question_answers (
      id,
      answer_letter,
      answer_text,
      is_correct
    )
  ),
  vsk_podcast_episodes!vsk_podcast_episodes_quiz_id_fkey (
    id,
    title,
    description,
    audio_src,
    full_audio_src,
    published_at,
    is_published,
    episode_number,
    season,
    duration,
    slug,
    image_url,
    thumbnail_path
  )
`;

/**
 * Check if a podcast-quiz entity has complete data
 */
export function isCompleteUnifiedEntity(entity: UnifiedPodcastQuizEntity): boolean {
  return !!(
    entity.quiz_id &&
    entity.quiz &&
    entity.quiz.questions &&
    entity.quiz.questions.length > 0 &&
    entity.quiz.questions.every(q => q.answers && q.answers.length > 0)
  );
}

/**
 * Get entity summary for logging/debugging
 */
export function getEntitySummary(entity: UnifiedPodcastQuizEntity): string {
  const quizInfo = entity.quiz 
    ? `quiz: ${entity.quiz.title} (${entity.quiz.questions.length} questions)`
    : 'quiz: missing';
  
  return `Podcast: ${entity.title}, ${quizInfo}`;
}