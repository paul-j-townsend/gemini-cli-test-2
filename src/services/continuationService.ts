import { QuizContinuationLimits, QuizContinuationStatus, Quiz } from '../types/database';

// Lazy load admin client to avoid importing on client side
const getSupabaseAdmin = async () => {
  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  return supabaseAdmin;
};

class ContinuationService {
  private readonly DEFAULT_MAX_ATTEMPTS = 3;
  private readonly DEFAULT_COOLDOWN_HOURS = 24;
  private readonly DEFAULT_RESET_DAYS = 7;

  async checkAttemptLimits(userId: string, quizId: string): Promise<QuizContinuationStatus> {
    try {
      console.log('Checking attempt limits for user:', userId, 'quiz:', quizId);
      const [quiz, continuationLimits] = await Promise.all([
        this.getQuizSettings(quizId),
        this.getContinuationLimits(userId, quizId)
      ]);
      console.log('Quiz found:', !!quiz, 'Continuation limits:', continuationLimits);

      if (!quiz) {
        console.log('Quiz not found in vsk_quizzes table, assuming content-based quiz - allowing attempt');
        // For content-based quizzes (podcast episodes), allow attempts by default
        return {
          canAttempt: true,
          attemptsRemaining: this.DEFAULT_MAX_ATTEMPTS - (continuationLimits?.attempts_used || 0),
          totalAttempts: this.DEFAULT_MAX_ATTEMPTS,
          attemptsUsed: continuationLimits?.attempts_used || 0,
          nextAttemptAvailableAt: null,
          resetAt: new Date().toISOString(),
          blockedUntil: null,
          message: 'Content-based quiz - attempts allowed'
        };
      }

      // Use defaults since unified content doesn't have these specific quiz settings
      const maxAttempts = this.DEFAULT_MAX_ATTEMPTS;
      const cooldownHours = this.DEFAULT_COOLDOWN_HOURS;
      const resetDays = this.DEFAULT_RESET_DAYS;

      let attemptsUsed = 0;
      let lastAttemptAt: Date | null = null;
      let blockedUntil: Date | null = null;
      let resetAt: Date = new Date();

      if (continuationLimits) {
        attemptsUsed = continuationLimits.attempts_used;
        lastAttemptAt = continuationLimits.last_attempt_at ? new Date(continuationLimits.last_attempt_at) : null;
        blockedUntil = continuationLimits.blocked_until ? new Date(continuationLimits.blocked_until) : null;
        resetAt = new Date(continuationLimits.reset_at);
      } else {
        // First time accessing this quiz - create initial record
        resetAt = new Date();
        resetAt.setDate(resetAt.getDate() + resetDays);
      }

      const now = new Date();
      const attemptsRemaining = maxAttempts - attemptsUsed;

      // Check if we're past the reset date
      if (now > resetAt) {
        await this.resetUserAttempts(userId, quizId);
        return {
          canAttempt: true,
          attemptsRemaining: maxAttempts,
          totalAttempts: maxAttempts,
          attemptsUsed: 0,
          nextAttemptAvailableAt: null,
          resetAt: this.calculateNextResetDate(resetDays).toISOString(),
          blockedUntil: null,
          message: 'Attempts have been reset'
        };
      }

      // Check if currently blocked
      if (blockedUntil && now < blockedUntil) {
        return {
          canAttempt: false,
          attemptsRemaining,
          totalAttempts: maxAttempts,
          attemptsUsed,
          nextAttemptAvailableAt: blockedUntil.toISOString(),
          resetAt: resetAt.toISOString(),
          blockedUntil: blockedUntil.toISOString(),
          message: `You are in cooldown. Next attempt available at ${blockedUntil.toLocaleString()}`
        };
      }

      // Check if attempts are exhausted
      if (attemptsUsed >= maxAttempts) {
        return {
          canAttempt: false,
          attemptsRemaining: 0,
          totalAttempts: maxAttempts,
          attemptsUsed,
          nextAttemptAvailableAt: resetAt.toISOString(),
          resetAt: resetAt.toISOString(),
          blockedUntil: null,
          message: `All attempts used. Attempts will reset on ${resetAt.toLocaleDateString()}`
        };
      }

      // Check cooldown from last attempt
      if (lastAttemptAt && cooldownHours > 0) {
        const nextAttemptTime = new Date(lastAttemptAt.getTime() + cooldownHours * 60 * 60 * 1000);
        if (now < nextAttemptTime) {
          return {
            canAttempt: false,
            attemptsRemaining,
            totalAttempts: maxAttempts,
            attemptsUsed,
            nextAttemptAvailableAt: nextAttemptTime.toISOString(),
            resetAt: resetAt.toISOString(),
            blockedUntil: nextAttemptTime.toISOString(),
            message: `Cooldown active. Next attempt available at ${nextAttemptTime.toLocaleString()}`
          };
        }
      }

      // Can attempt
      return {
        canAttempt: true,
        attemptsRemaining,
        totalAttempts: maxAttempts,
        attemptsUsed,
        nextAttemptAvailableAt: null,
        resetAt: resetAt.toISOString(),
        blockedUntil: null,
        message: `${attemptsRemaining} attempts remaining`
      };
    } catch (error) {
      console.error('Error checking attempt limits:', error);
      return {
        canAttempt: false,
        attemptsRemaining: 0,
        totalAttempts: 0,
        attemptsUsed: 0,
        nextAttemptAvailableAt: null,
        resetAt: new Date().toISOString(),
        blockedUntil: null,
        message: 'Error checking attempt limits'
      };
    }
  }

  async recordAttempt(userId: string, quizId: string, passed: boolean = false): Promise<void> {
    try {
      // Since vsk_quiz_continuation_limits table doesn't exist, we'll gracefully skip
      // but log the attempt for debugging purposes
      console.log('Recording attempt for user:', userId, 'quiz:', quizId, 'passed:', passed);
      console.log('vsk_quiz_continuation_limits table not found, skipping attempt recording');
      return;
    } catch (error) {
      console.error('Error recording attempt:', error);
      // Don't throw the error - just log it so quiz completion can continue
      console.log('Continuing with quiz completion despite attempt recording error');
    }
  }

  async resetUserAttempts(userId: string, quizId: string): Promise<void> {
    try {
      // Since vsk_quiz_continuation_limits table doesn't exist, we'll gracefully skip
      console.log('Resetting attempts for user:', userId, 'quiz:', quizId);
      console.log('vsk_quiz_continuation_limits table not found, skipping reset');
      return;
    } catch (error) {
      console.error('Error resetting user attempts:', error);
      // Don't throw the error - just log it
      console.log('Continuing despite reset error');
    }
  }

  async getRemainingAttempts(userId: string, quizId: string): Promise<number> {
    const status = await this.checkAttemptLimits(userId, quizId);
    return status.attemptsRemaining;
  }

  async getNextAttemptAvailableTime(userId: string, quizId: string): Promise<Date | null> {
    const status = await this.checkAttemptLimits(userId, quizId);
    return status.nextAttemptAvailableAt ? new Date(status.nextAttemptAvailableAt) : null;
  }

  async getContinuationStats(quizId: string): Promise<{
    totalUsers: number;
    averageAttemptsUsed: number;
    completionRateByAttempt: { attempt: number; completionRate: number }[];
  }> {
    try {
      // Since vsk_quiz_continuation_limits table doesn't exist, return default stats
      console.log('Getting continuation stats for quiz:', quizId);
      console.log('vsk_quiz_continuation_limits table not found, returning default stats');
      
      return {
        totalUsers: 0,
        averageAttemptsUsed: 0,
        completionRateByAttempt: []
      };
    } catch (error) {
      console.error('Error getting continuation stats:', error);
      return {
        totalUsers: 0,
        averageAttemptsUsed: 0,
        completionRateByAttempt: []
      };
    }
  }

  private async getQuizSettings(quizId: string): Promise<Quiz | null> {
    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as Quiz | null;
    } catch (error) {
      console.error('Error getting quiz settings:', error);
      return null;
    }
  }

  private async getContinuationLimits(userId: string, quizId: string): Promise<QuizContinuationLimits | null> {
    try {
      // Since vsk_quiz_continuation_limits table doesn't exist, return null
      // This will cause the service to use default limits
      console.log('vsk_quiz_continuation_limits table not found, using default limits');
      return null;
    } catch (error) {
      console.error('Error getting continuation limits:', error);
      return null;
    }
  }

  private calculateNextResetDate(resetDays: number): Date {
    const resetAt = new Date();
    resetAt.setDate(resetAt.getDate() + resetDays);
    return resetAt;
  }
}

export const continuationService = new ContinuationService();
export default continuationService;