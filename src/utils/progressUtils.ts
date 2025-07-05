import { QuizCompletion, UserProgress } from '../types/database';

export interface ProgressSummary {
  totalQuizzesCompleted: number;
  totalQuizzesPassed: number;
  averageScore: number;
  completionRate: number;
  recentActivity: QuizCompletion[];
  streakDays: number;
  timeSpent: number;
  topCategories: CategoryProgress[];
  achievements: Achievement[];
}

export interface CategoryProgress {
  category: string;
  completed: number;
  passed: number;
  averageScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'completion' | 'score' | 'streak' | 'special';
  progress?: number;
  maxProgress?: number;
}

export interface QuizProgressStats {
  quizId: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  lastAttempt: string;
  passed: boolean;
}

// Calculate user's overall progress
export const calculateUserProgress = (completions: QuizCompletion[]): ProgressSummary => {
  if (completions.length === 0) {
    return {
      totalQuizzesCompleted: 0,
      totalQuizzesPassed: 0,
      averageScore: 0,
      completionRate: 0,
      recentActivity: [],
      streakDays: 0,
      timeSpent: 0,
      topCategories: [],
      achievements: []
    };
  }

  const totalCompleted = completions.length;
  const totalPassed = completions.filter(c => c.passed).length;
  const totalScore = completions.reduce((sum, c) => sum + c.score, 0);
  const totalMaxScore = completions.reduce((sum, c) => sum + c.maxScore, 0);
  const averageScore = Math.round((totalScore / totalMaxScore) * 100);
  const completionRate = Math.round((totalPassed / totalCompleted) * 100);
  const totalTimeSpent = completions.reduce((sum, c) => sum + c.timeSpent, 0);

  // Get recent activity (last 5 completions)
  const recentActivity = [...completions]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  // Calculate streak days
  const streakDays = calculateStreakDays(completions);

  // Calculate top categories (if quiz data includes categories)
  const topCategories = calculateTopCategories(completions);

  // Generate achievements
  const achievements = generateAchievements(completions, {
    totalCompleted,
    totalPassed,
    averageScore,
    streakDays,
    totalTimeSpent
  });

  return {
    totalQuizzesCompleted: totalCompleted,
    totalQuizzesPassed: totalPassed,
    averageScore,
    completionRate,
    recentActivity,
    streakDays,
    timeSpent: totalTimeSpent,
    topCategories,
    achievements
  };
};

// Calculate streak days based on completion dates
export const calculateStreakDays = (completions: QuizCompletion[]): number => {
  if (completions.length === 0) return 0;

  const completionDates = completions
    .map(c => new Date(c.completedAt).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const uniqueDates = [...new Set(completionDates)];
  
  let streak = 0;
  const today = new Date().toDateString();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const date = new Date(uniqueDates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - streak);
    
    if (date.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Calculate progress by category
export const calculateTopCategories = (completions: QuizCompletion[]): CategoryProgress[] => {
  // For now, we'll use a placeholder since quiz categories aren't in the current schema
  // In a real implementation, you'd group by quiz categories
  const categoryMap = new Map<string, QuizCompletion[]>();
  
  completions.forEach(completion => {
    const category = 'General'; // Placeholder - would get from quiz data
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(completion);
  });

  return Array.from(categoryMap.entries()).map(([category, completions]) => {
    const passed = completions.filter(c => c.passed).length;
    const totalScore = completions.reduce((sum, c) => sum + c.score, 0);
    const totalMaxScore = completions.reduce((sum, c) => sum + c.maxScore, 0);
    
    return {
      category,
      completed: completions.length,
      passed,
      averageScore: Math.round((totalScore / totalMaxScore) * 100)
    };
  }).sort((a, b) => b.completed - a.completed);
};

// Generate achievements based on user progress
export const generateAchievements = (
  completions: QuizCompletion[], 
  stats: { totalCompleted: number; totalPassed: number; averageScore: number; streakDays: number; totalTimeSpent: number }
): Achievement[] => {
  const achievements: Achievement[] = [];

  // First quiz achievement
  if (stats.totalCompleted >= 1) {
    achievements.push({
      id: 'first-quiz',
      name: 'First Steps',
      description: 'Completed your first quiz',
      icon: '🎯',
      earnedAt: completions[0]?.completedAt || '',
      category: 'completion'
    });
  }

  // Quiz master achievements
  if (stats.totalCompleted >= 5) {
    achievements.push({
      id: 'quiz-novice',
      name: 'Quiz Novice',
      description: 'Completed 5 quizzes',
      icon: '📚',
      earnedAt: completions[4]?.completedAt || '',
      category: 'completion'
    });
  }

  if (stats.totalCompleted >= 10) {
    achievements.push({
      id: 'quiz-apprentice',
      name: 'Quiz Apprentice',
      description: 'Completed 10 quizzes',
      icon: '🎓',
      earnedAt: completions[9]?.completedAt || '',
      category: 'completion'
    });
  }

  if (stats.totalCompleted >= 25) {
    achievements.push({
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Completed 25 quizzes',
      icon: '👑',
      earnedAt: completions[24]?.completedAt || '',
      category: 'completion'
    });
  }

  // High score achievements
  if (stats.averageScore >= 80) {
    achievements.push({
      id: 'high-achiever',
      name: 'High Achiever',
      description: 'Maintained 80%+ average score',
      icon: '🏆',
      earnedAt: new Date().toISOString(),
      category: 'score'
    });
  }

  if (stats.averageScore >= 90) {
    achievements.push({
      id: 'excellence',
      name: 'Excellence',
      description: 'Maintained 90%+ average score',
      icon: '⭐',
      earnedAt: new Date().toISOString(),
      category: 'score'
    });
  }

  // Perfect score achievement
  const perfectScores = completions.filter(c => c.percentage === 100);
  if (perfectScores.length >= 1) {
    achievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Scored 100% on a quiz',
      icon: '💎',
      earnedAt: perfectScores[0].completedAt,
      category: 'score'
    });
  }

  // Streak achievements
  if (stats.streakDays >= 3) {
    achievements.push({
      id: 'three-day-streak',
      name: 'Consistent Learner',
      description: '3-day learning streak',
      icon: '🔥',
      earnedAt: new Date().toISOString(),
      category: 'streak'
    });
  }

  if (stats.streakDays >= 7) {
    achievements.push({
      id: 'week-streak',
      name: 'Dedicated Student',
      description: '7-day learning streak',
      icon: '🌟',
      earnedAt: new Date().toISOString(),
      category: 'streak'
    });
  }

  // Time-based achievements
  if (stats.totalTimeSpent >= 3600) { // 1 hour
    achievements.push({
      id: 'time-invested',
      name: 'Time Invested',
      description: 'Spent over 1 hour learning',
      icon: '⏰',
      earnedAt: new Date().toISOString(),
      category: 'special'
    });
  }

  return achievements.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
};

// Get quiz-specific progress
export const getQuizProgress = (completions: QuizCompletion[], quizId: string): QuizProgressStats | null => {
  const quizCompletions = completions.filter(c => c.quizId === quizId);
  
  if (quizCompletions.length === 0) return null;

  const scores = quizCompletions.map(c => c.score);
  const bestScore = Math.max(...scores);
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const totalTimeSpent = quizCompletions.reduce((sum, c) => sum + c.timeSpent, 0);
  const lastAttempt = quizCompletions.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0].completedAt;
  const passed = quizCompletions.some(c => c.passed);

  return {
    quizId,
    attempts: quizCompletions.length,
    bestScore,
    averageScore,
    timeSpent: totalTimeSpent,
    lastAttempt,
    passed
  };
};

// Format time duration
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

// Calculate level based on total score
export const calculateUserLevel = (totalScore: number): { level: number; progress: number; nextLevelScore: number } => {
  const baseScorePerLevel = 1000;
  const level = Math.floor(totalScore / baseScorePerLevel) + 1;
  const currentLevelScore = totalScore % baseScorePerLevel;
  const nextLevelScore = baseScorePerLevel;
  const progress = Math.round((currentLevelScore / nextLevelScore) * 100);

  return {
    level,
    progress,
    nextLevelScore: nextLevelScore - currentLevelScore
  };
};

// Get user rank compared to others (would need all users' data)
export const calculateUserRank = (userScore: number, allUserScores: number[]): { rank: number; percentile: number } => {
  const sortedScores = allUserScores.sort((a, b) => b - a);
  const rank = sortedScores.indexOf(userScore) + 1;
  const percentile = Math.round(((allUserScores.length - rank + 1) / allUserScores.length) * 100);

  return { rank, percentile };
};