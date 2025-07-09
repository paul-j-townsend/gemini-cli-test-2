export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode: number;
}

export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  data: T;
  success: true;
}

export interface ApiErrorResponse extends ApiResponse {
  error: string;
  success: false;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiMethodHandlers {
  GET?: (req: any, res: any) => Promise<void>;
  POST?: (req: any, res: any) => Promise<void>;
  PUT?: (req: any, res: any) => Promise<void>;
  DELETE?: (req: any, res: any) => Promise<void>;
  PATCH?: (req: any, res: any) => Promise<void>;
}

export interface ApiHandlerOptions {
  allowedMethods?: string[];
  requireAuth?: boolean;
  requireAdmin?: boolean;
  cors?: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export interface QuizCompletionData {
  quiz_id: string;
  user_id: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent?: number;
  answers: any[];
  passed: boolean;
  attempts?: number;
}

export interface QuizData {
  title: string;
  description?: string;
  category?: string;
  pass_percentage?: number;
  questions?: QuizQuestionData[];
  quiz_questions?: QuizQuestionData[];
}

export interface QuizQuestionData {
  question_number: number;
  question_text: string;
  explanation?: string;
  rationale?: string;
  learning_outcome?: string;
  points?: number;
  answers?: QuizAnswerData[];
  question_answers?: QuizAnswerData[];
}

export interface QuizAnswerData {
  answer_letter: string;
  answer_text: string;
  is_correct: boolean;
}

export interface ArticleData {
  title: string;
  content?: string;
  excerpt?: string;
  author?: string;
  category?: string;
  published?: boolean;
  featured?: boolean;
  slug?: string;
}

export interface UserProgressData {
  total_quizzes_completed: number;
  total_quizzes_passed: number;
  average_score: number;
  total_time_spent: number;
  badges_earned: string[];
  streak_days: number;
  last_activity: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestValidationSchema {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
}