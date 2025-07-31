export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  email_verified: boolean;
  preferences?: UserPreferences;
  auth_provider?: 'email' | 'google' | 'facebook' | null;
  supabase_auth_id?: string | null;
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
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified: boolean;
  preferences: UserPreferences | null;
  auth_provider: 'email' | 'google' | 'facebook' | null;
  supabase_auth_id: string | null;
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

// Content completion tracking (unified)
export interface ContentCompletion {
  id: string;
  user_id: string;
  content_id: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number; // in seconds
  completed_at: string;
  answers: ContentAnswer[];
  passed: boolean;
  attempts: number;
}

// Actual database table structure for quiz completions
export interface QuizCompletionTable {
  id: string;
  user_id: string;
  quiz_id: string; // This is what the database actually has
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  answers: ContentAnswer[];
  passed: boolean;
  attempts: number;
  quiz_title?: string; // Preserved title for historical reference
  content_title?: string; // Preserved content title for historical reference
}

// Legacy aliases for backward compatibility
export type QuizCompletion = QuizCompletionTable; // Use the actual table structure
export type PodcastEpisode = Content;
export type QuizAnswer = ContentAnswer;
export type Quiz = Content;

export interface ContentAnswer {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  points: number;
}

export interface ContentCompletionsTable {
  id: string;
  user_id: string;
  content_id: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  answers: ContentAnswer[];
  passed: boolean;
  attempts: number;
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

// Series interface
export interface Series {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeriesTable {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Unified Content (Podcast + Quiz)
export interface Content {
  id: string;
  // Podcast fields
  title: string;
  description: string;
  audio_src: string;
  full_audio_src: string;
  image_url: string | null;
  thumbnail_path: string;
  duration: number | null;
  episode_number: number;
  season: number;
  slug: string;
  published_at: string | null;
  is_published: boolean;
  featured: boolean;
  category: string | null;
  tags: string[] | null;
  show_notes: string | null;
  transcript: string | null;
  file_size: number | null;
  meta_title: string | null;
  meta_description: string | null;
  // Quiz fields
  quiz_title: string | null;
  quiz_description: string | null;
  quiz_category: string | null;
  pass_percentage: number;
  total_questions: number;
  quiz_is_active: boolean;
  // Series field
  series_id: string | null;
  // Payment fields
  price_cents: number | null;
  stripe_price_id: string | null;
  is_purchasable: boolean;
  // Special offer pricing fields
  special_offer_price_cents: number | null;
  special_offer_active: boolean;
  special_offer_start_date: string | null;
  special_offer_end_date: string | null;
  special_offer_description: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
  // Related data
  vsk_content_questions?: ContentQuestion[];
  series?: Series; // Joined data
}

export interface ContentTable {
  id: string;
  title: string;
  description: string | null;
  audio_src: string | null;
  full_audio_src: string | null;
  image_url: string | null;
  thumbnail_path: string | null;
  duration: number | null;
  episode_number: number;
  season: number;
  slug: string | null;
  published_at: string | null;
  is_published: boolean;
  featured: boolean;
  category: string | null;
  tags: string[] | null;
  show_notes: string | null;
  transcript: string | null;
  file_size: number | null;
  meta_title: string | null;
  meta_description: string | null;
  quiz_title: string | null;
  quiz_description: string | null;
  quiz_category: string | null;
  pass_percentage: number;
  total_questions: number;
  quiz_is_active: boolean;
  series_id: string | null;
  // Payment fields
  price_cents: number | null;
  stripe_price_id: string | null;
  is_purchasable: boolean;
  // Special offer pricing fields
  special_offer_price_cents: number | null;
  special_offer_active: boolean;
  special_offer_start_date: string | null;
  special_offer_end_date: string | null;
  special_offer_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentQuestion {
  id: string;
  content_id: string;
  question_number: number;
  question_text: string;
  explanation: string | null;
  rationale: string | null;
  learning_outcome: string | null;
  created_at: string;
  updated_at: string;
  vsk_content_question_answers?: ContentQuestionAnswer[];
}

export interface ContentQuestionAnswer {
  id: string;
  question_id: string;
  answer_letter: string; // 'A', 'B', 'C', 'D', 'E'
  answer_text: string;
  is_correct: boolean;
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

// Type guards for validating unified content
export function isValidContent(obj: any): obj is Content {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.episode_number === 'number' &&
    typeof obj.season === 'number'
  );
}

export function hasValidContentStructure(obj: any): boolean {
  return (
    isValidContent(obj) &&
    obj.total_questions >= 0 &&
    obj.pass_percentage >= 0 &&
    obj.pass_percentage <= 100
  );
}

// Payment-related types

export type PurchaseStatus = 'completed' | 'refunded' | 'disputed' | 'pending';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing';

// Content purchases interface
export interface ContentPurchase {
  id: string;
  user_id: string;
  content_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount_paid_cents: number;
  currency: string;
  purchased_at: string;
  status: PurchaseStatus;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPurchaseTable {
  id: string;
  user_id: string;
  content_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount_paid_cents: number;
  currency: string;
  purchased_at: string;
  status: PurchaseStatus;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Subscription interface
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionTable {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

// Extended User interface to include payment information
export interface UserWithPayments extends User {
  purchases?: ContentPurchase[];
  subscription?: Subscription | null;
  hasActiveSubscription?: boolean;
}

// Payment-related utility types
export interface PaymentSummary {
  totalPurchases: number;
  totalSpent: number;
  hasActiveSubscription: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  purchasedContentIds: string[];
}

// Type guards for payment types
export function isValidPurchase(obj: any): obj is ContentPurchase {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.content_id === 'string' &&
    typeof obj.amount_paid_cents === 'number' &&
    ['completed', 'refunded', 'disputed', 'pending'].includes(obj.status)
  );
}

export function isValidSubscription(obj: any): obj is Subscription {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.stripe_subscription_id === 'string' &&
    ['active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing'].includes(obj.status)
  );
}