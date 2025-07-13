import { supabaseAdmin } from '@/lib/supabase-admin';
import { QuizContinuationLimits, QuizContinuationStatus, Quiz } from '../types/database';

class ContinuationService {
  private readonly DEFAULT_MAX_ATTEMPTS = 3;
  private readonly DEFAULT_COOLDOWN_HOURS = 24;
  private readonly DEFAULT_RESET_DAYS = 7;

  async checkAttemptLimits(userId: string, quizId: string): Promise<QuizContinuationStatus> {
    try {
      const [quiz, continuationLimits] = await Promise.all([
        this.getQuizSettings(quizId),
        this.getContinuationLimits(userId, quizId)
      ]);

      if (!quiz) {
        return {
          canAttempt: false,
          attemptsRemaining: 0,
          totalAttempts: 0,
          attemptsUsed: 0,
          nextAttemptAvailableAt: null,
          resetAt: new Date().toISOString(),
          blockedUntil: null,
          message: 'Quiz not found'
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
      const [quiz, continuationLimits] = await Promise.all([
        this.getQuizSettings(quizId),
        this.getContinuationLimits(userId, quizId)
      ]);

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const cooldownHours = this.DEFAULT_COOLDOWN_HOURS;
      const resetDays = this.DEFAULT_RESET_DAYS;
      const now = new Date();

      let blockedUntil: Date | null = null;
      if (cooldownHours > 0 && !passed) {
        blockedUntil = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
      }

      if (continuationLimits) {
        // Update existing record
        await supabaseAdmin
          .from('vsk_quiz_continuation_limits')
          .update({
            attempts_used: continuationLimits.attempts_used + 1,
            last_attempt_at: now.toISOString(),
            blocked_until: blockedUntil?.toISOString() || null,
            updated_at: now.toISOString()
          })
          .eq('id', continuationLimits.id);
      } else {
        // Create new record
        const resetAt = new Date();
        resetAt.setDate(resetAt.getDate() + resetDays);

        await supabaseAdmin
          .from('vsk_quiz_continuation_limits')
          .insert({
            user_id: userId,
            quiz_id: quizId,
            attempts_used: 1,
            last_attempt_at: now.toISOString(),
            blocked_until: blockedUntil?.toISOString() || null,
            reset_at: resetAt.toISOString()
          });
      }
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  }

  async resetUserAttempts(userId: string, quizId: string): Promise<void> {
    try {
      const resetDays = this.DEFAULT_RESET_DAYS;
      const resetAt = this.calculateNextResetDate(resetDays);

      await supabaseAdmin
        .from('vsk_quiz_continuation_limits')
        .upsert({
          user_id: userId,
          quiz_id: quizId,
          attempts_used: 0,
          last_attempt_at: null,
          blocked_until: null,
          reset_at: resetAt.toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error resetting user attempts:', error);
      throw error;
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
      const { data, error } = await supabaseAdmin
        .from('vsk_quiz_continuation_limits')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalUsers: 0,
          averageAttemptsUsed: 0,
          completionRateByAttempt: []
        };
      }

      const totalUsers = data.length;
      const totalAttempts = data.reduce((sum, record) => sum + record.attempts_used, 0);
      const averageAttemptsUsed = totalAttempts / totalUsers;

      // For completion rate by attempt, we'd need to join with completion data
      // This is a placeholder implementation
      const completionRateByAttempt = [
        { attempt: 1, completionRate: 0.7 },
        { attempt: 2, completionRate: 0.5 },
        { attempt: 3, completionRate: 0.3 }
      ];

      return {
        totalUsers,
        averageAttemptsUsed,
        completionRateByAttempt
      };
    } catch (error) {
      console.error('Error getting continuation stats:', error);
      throw error;
    }
  }

  private async getQuizSettings(quizId: string): Promise<Quiz | null> {
    try {
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
      const { data, error } = await supabaseAdmin
        .from('vsk_quiz_continuation_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as QuizContinuationLimits | null;
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