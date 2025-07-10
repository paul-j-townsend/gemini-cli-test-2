export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  email_verified: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  timezone: string;
  language: string;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  device?: string;
  ipAddress?: string;
}

// Database table interfaces
export interface UsersTable {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified: boolean;
  preferences: UserPreferences | null;
}

export interface UserSessionsTable {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  device: string | null;
  ip_address: string | null;
}

export interface UserPermissionsTable {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface RolePermissionsTable {
  id: string;
  role: UserRole;
  permission_id: string;
  created_at: string;
}

// Quiz completion tracking
export interface QuizCompletion {
  id: string;
  user_id: string;
  quiz_id: string;
  podcast_id?: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number; // in seconds
  completed_at: string;
  answers: QuizAnswer[];
  passed: boolean;
  attempts: number;
  attempt_number?: number;
  next_attempt_available_at?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  points: number;
}

export interface QuizCompletionsTable {
  id: string;
  user_id: string;
  quiz_id: string;
  podcast_id: string | null;
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  answers: QuizAnswer[];
  passed: boolean;
  attempts: number;
  attempt_number: number;
  next_attempt_available_at: string | null;
}

// User progress tracking
export interface UserProgress {
  user_id: string;
  total_quizzes_completed: number;
  total_quizzes_passed: number;
  total_score: number;
  total_max_score: number;
  average_score: number;
  total_time_spent: number;
  completion_rate: number;
  last_activity_at: string;
  streak_days: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'completion' | 'score' | 'streak' | 'special';
}

export interface UserProgressTable {
  id: string;
  user_id: string;
  total_quizzes_completed: number;
  total_quizzes_passed: number;
  total_score: number;
  total_max_score: number;
  average_score: number;
  total_time_spent: number;
  completion_rate: number;
  last_activity_at: string;
  streak_days: number;
  badges: Badge[];
  updated_at: string;
}

// Quiz and Quiz Questions
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  podcast_id?: string;
  max_attempts?: number;
  cooldown_period_hours?: number;
  reset_period_days?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizTable {
  id: string;
  title: string;
  description: string;
  category: string;
  podcast_id: string | null;
  max_attempts?: number;
  cooldown_period_hours?: number;
  reset_period_days?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  explanation: string;
  rationale: string;
  learning_outcome: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  answer_key: string; // 'A', 'B', 'C', 'D'
  created_at: string;
}

// Quiz continuation limits tracking
export interface QuizContinuationLimits {
  id: string;
  user_id: string;
  quiz_id: string;
  attempts_used: number;
  last_attempt_at: string | null;
  blocked_until: string | null;
  reset_at: string;
  custom_max_attempts: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuizContinuationLimitsTable {
  id: string;
  user_id: string;
  quiz_id: string;
  attempts_used: number;
  last_attempt_at: string | null;
  blocked_until: string | null;
  reset_at: string;
  custom_max_attempts: number | null;
  created_at: string;
  updated_at: string;
}

// Continuation status for frontend
export interface QuizContinuationStatus {
  canAttempt: boolean;
  attemptsRemaining: number;
  totalAttempts: number;
  attemptsUsed: number;
  nextAttemptAvailableAt: string | null;
  resetAt: string;
  blockedUntil: string | null;
  message: string;
}