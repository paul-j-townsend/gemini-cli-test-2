import { supabaseAdmin } from '@/lib/supabase-admin';
import { QuizCompletion, QuizAnswer, UserProgress, Badge, QuizContinuationStatus } from '../types/database';
import { continuationService } from './continuationService';

class QuizCompletionService {
  async createCompletion(completion: Omit<QuizCompletion, 'id'>): Promise<QuizCompletion> {
    // Check attempt limits before creating completion
    const continuationStatus = await continuationService.checkAttemptLimits(completion.user_id, completion.quiz_id);
    
    if (!continuationStatus.canAttempt) {
      throw new Error(`Cannot create completion: ${continuationStatus.message}`);
    }

    // Get current attempt number
    const currentAttempts = await this.getUserQuizAttempts(completion.user_id, completion.quiz_id);
    const attemptNumber = currentAttempts + 1;

    // Check if user has existing completions for this quiz
    const existingBest = await this.getUserBestScore(completion.user_id, completion.quiz_id);
    
    // Only save if this is the first attempt or if the new score is higher
    const shouldSave = !existingBest || completion.percentage > existingBest.percentage;
    
    if (!shouldSave) {
      console.log(`Score ${completion.percentage}% is not higher than existing best ${existingBest!.percentage}%, not saving`);
      // Still record the attempt for continuation tracking
      await continuationService.recordAttempt(completion.user_id, completion.quiz_id, completion.passed);
      // Return the existing best completion instead of creating a new one
      return existingBest!;
    }

    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert({
        user_id: completion.user_id,
        quiz_id: completion.quiz_id,
        podcast_id: completion.podcast_id,
        score: completion.score,
        max_score: completion.max_score,
        percentage: completion.percentage,
        time_spent: completion.time_spent,
        completed_at: completion.completed_at,
        answers: completion.answers,
        passed: completion.passed,
        attempts: completion.attempts,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating completion:', error);
      throw new Error('Failed to create quiz completion');
    }

    // Record the attempt in continuation service
    await continuationService.recordAttempt(completion.user_id, completion.quiz_id, completion.passed);

    await this.updateUserProgress(completion.user_id, data as QuizCompletion);
    return data as QuizCompletion;
  }

  async findCompletionsByUserId(userId: string): Promise<QuizCompletion[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching completions by user ID:', error);
      throw new Error('Failed to fetch quiz completions');
    }
    return data as QuizCompletion[];
  }

  async findCompletionById(id: string): Promise<QuizCompletion | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching completion by ID:', error);
      throw new Error('Failed to fetch quiz completion');
    }
    return data as QuizCompletion | null;
  }

  async findCompletionsByQuizId(quiz_id: string): Promise<QuizCompletion[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('quiz_id', quiz_id);

    if (error) {
      console.error('Error fetching completions by quiz ID:', error);
      throw new Error('Failed to fetch quiz completions');
    }
    return data as QuizCompletion[];
  }


  async hasUserCompletedQuiz(user_id: string, quiz_id: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id')
      .eq('user_id', user_id)
      .eq('quiz_id', quiz_id)
      .limit(1);

    if (error) {
      console.error('Error checking quiz completion:', error);
      throw new Error('Failed to check quiz completion');
    }
    return data.length > 0;
  }

  async hasUserPassedQuiz(user_id: string, quiz_id: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id')
      .eq('user_id', user_id)
      .eq('quiz_id', quiz_id)
      .eq('passed', true)
      .limit(1);

    if (error) {
      console.error('Error checking quiz pass:', error);
      throw new Error('Failed to check quiz pass');
    }
    return data.length > 0;
  }

  async getUserQuizAttempts(user_id: string, quiz_id: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('quiz_id', quiz_id);

    if (error) {
      console.error('Error getting quiz attempts:', error);
      throw new Error('Failed to get quiz attempts');
    }
    return count || 0;
  }

  async getUserBestScore(user_id: string, quiz_id: string): Promise<QuizCompletion | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('user_id', user_id)
      .eq('quiz_id', quiz_id)
      .order('percentage', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting best score:', error);
      throw new Error('Failed to get best score');
    }
    return data as QuizCompletion | null;
  }

  async getRecentCompletions(limit: number = 10): Promise<QuizCompletion[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent completions:', error);
      throw new Error('Failed to get recent completions');
    }
    return data as QuizCompletion[];
  }

  async getUserRecentCompletions(user_id: string, limit: number = 10): Promise<QuizCompletion[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting user recent completions:', error);
      throw new Error('Failed to get user recent completions');
    }
    return data as QuizCompletion[];
  }

  async deleteCompletion(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting completion:', error);
      return false;
    }

    return true;
  }

  

  async getUserProgress(user_id: string): Promise<UserProgress | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_user_progress')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user progress:', error);
      throw new Error('Failed to fetch user progress');
    }
    return data as UserProgress | null;
  }

  async updateUserProgress(user_id: string, completion: QuizCompletion): Promise<UserProgress> {
    let { data: progress, error: fetchError } = await supabaseAdmin
      .from('vsk_user_progress')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user progress for update:', fetchError);
      throw new Error('Failed to fetch user progress for update');
    }

    if (!progress) {
      // If no progress exists, create a new entry
      const newProgress = {
        user_id: user_id,
        total_quizzes_completed: 0,
        total_quizzes_passed: 0,
        total_score: 0,
        total_max_score: 0,
        average_score: 0,
        total_time_spent: 0,
        completion_rate: 0,
        last_activity_at: completion.completed_at,
        streak_days: 0,
        badges: []
      };
      const { data: insertedProgress, error: insertError } = await supabaseAdmin
        .from('vsk_user_progress')
        .insert(newProgress)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting new user progress:', insertError);
        throw new Error('Failed to insert new user progress');
      }
      progress = insertedProgress as UserProgress;
    }

    // Update progress stats
    progress.total_quizzes_completed += 1;
    if (completion.passed) {
      progress.total_quizzes_passed += 1;
    }
    progress.total_score += completion.score;
    progress.total_max_score += completion.max_score;
    progress.average_score = Math.round((progress.total_score / progress.total_max_score) * 100);
    progress.total_time_spent += completion.time_spent;
    progress.completion_rate = Math.round((progress.total_quizzes_passed / progress.total_quizzes_completed) * 100);
    progress.last_activity_at = completion.completed_at;

    // Award badges
    await this.checkAndAwardBadges(user_id, progress, completion);

    // Save updated progress to DB
    const { data: updatedProgress, error: updateError } = await supabaseAdmin
      .from('vsk_user_progress')
      .update(progress)
      .eq('user_id', user_id)
      .single();

    if (updateError) {
      console.error('Error updating user progress:', updateError);
      throw new Error('Failed to update user progress');
    }

    return updatedProgress as UserProgress;
  }

  private async checkAndAwardBadges(user_id: string, progress: UserProgress, completion: QuizCompletion): Promise<void> {
    const newBadges: Badge[] = [];

    // First quiz badge
    if (progress.total_quizzes_completed === 1 && !progress.badges.some(b => b.id === 'first-quiz')) {
      newBadges.push({
        id: 'first-quiz',
        name: 'First Quiz',
        description: 'Completed your first quiz',
        icon: '🎯',
        earned_at: completion.completed_at,
        category: 'completion'
      });
    }

    // High scorer badge
    if (progress.average_score >= 80 && progress.total_quizzes_completed >= 5 && !progress.badges.some(b => b.id === 'high-scorer')) {
      newBadges.push({
        id: 'high-scorer',
        name: 'High Scorer',
        description: 'Scored 80% or higher on 5 quizzes',
        icon: '🏆',
        earned_at: completion.completed_at,
        category: 'score'
      });
    }

    // Perfect score badge
    if (completion.percentage === 100 && !progress.badges.some(b => b.id === 'perfect-score')) {
      newBadges.push({
        id: 'perfect-score',
        name: 'Perfect Score',
        description: 'Scored 100% on a quiz',
        icon: '⭐',
        earned_at: completion.completed_at,
        category: 'score'
      });
    }

    // Quiz master badge
    if (progress.total_quizzes_completed >= 10 && !progress.badges.some(b => b.id === 'quiz-master')) {
      newBadges.push({
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Completed 10 quizzes',
        icon: '🎓',
        earned_at: completion.completed_at,
        category: 'completion'
      });
    }

    progress.badges.push(...newBadges);
  }

  async getLeaderboard(limit: number = 10): Promise<UserProgress[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_user_progress')
      .select('*')
      .order('average_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to get leaderboard');
    }
    return data as UserProgress[];
  }

  async getQuizStats(quiz_id: string): Promise<{
    totalAttempts: number;
    totalPassed: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
  }> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('quiz_id', quiz_id);

    if (error) {
      console.error('Error getting quiz stats:', error);
      throw new Error('Failed to get quiz stats');
    }

    if (data.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0
      };
    }

    const totalPassed = data.filter(c => c.passed).length;
    const totalScore = data.reduce((sum, c) => sum + c.score, 0);
    const totalMaxScore = data.reduce((sum, c) => sum + c.max_score, 0);
    const totalTimeSpent = data.reduce((sum, c) => sum + c.time_spent, 0);

    return {
      totalAttempts: data.length,
      totalPassed,
      averageScore: Math.round((totalScore / totalMaxScore) * 100),
      passRate: Math.round((totalPassed / data.length) * 100),
      averageTimeSpent: Math.round(totalTimeSpent / data.length)
    };
  }

  // Continuation-related methods
  async checkAttemptLimits(userId: string, quizId: string): Promise<QuizContinuationStatus> {
    return await continuationService.checkAttemptLimits(userId, quizId);
  }

  async getRemainingAttempts(userId: string, quizId: string): Promise<number> {
    return await continuationService.getRemainingAttempts(userId, quizId);
  }

  async getNextAttemptAvailableTime(userId: string, quizId: string): Promise<Date | null> {
    return await continuationService.getNextAttemptAvailableTime(userId, quizId);
  }

  async resetUserAttempts(userId: string, quizId: string): Promise<void> {
    return await continuationService.resetUserAttempts(userId, quizId);
  }

  async getContinuationStats(quizId: string): Promise<{
    totalUsers: number;
    averageAttemptsUsed: number;
    completionRateByAttempt: { attempt: number; completionRate: number }[];
  }> {
    return await continuationService.getContinuationStats(quizId);
  }

  
}

export const quizCompletionService = new QuizCompletionService();
export default quizCompletionService;