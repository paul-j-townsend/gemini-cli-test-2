import * as React from 'react';
import { useCallback, useMemo, useRef, useEffect } from 'react';

export const createStableComparator = <T>(
  compareFn: (a: T, b: T) => number
) => {
  return useCallback(compareFn, []);
};

export const useMemoizedSortedData = <T>(
  data: T[],
  compareFn: (a: T, b: T) => number,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return [...data].sort(compareFn);
  }, [data, compareFn, ...dependencies]);
};

export const useMemoizedFilteredData = <T>(
  data: T[],
  filterFn: (item: T) => boolean,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return data.filter(filterFn);
  }, [data, filterFn, ...dependencies]);
};

export const useMemoizedGroupedData = <T, K extends string | number>(
  data: T[],
  groupBy: (item: T) => K,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return data.reduce((groups, item) => {
      const key = groupBy(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }, [data, groupBy, ...dependencies]);
};

export const useMemoizedProgressCalculations = (
  completions: any[],
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    if (!completions || completions.length === 0) {
      return {
        totalQuizzes: 0,
        totalPassed: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        streakDays: 0,
        recentActivity: [],
        achievements: []
      };
    }

    const totalQuizzes = completions.length;
    const totalPassed = completions.filter(c => c.passed).length;
    const averageScore = Math.round(
      completions.reduce((sum, c) => sum + c.percentage, 0) / totalQuizzes
    );
    const totalTimeSpent = completions.reduce((sum, c) => sum + (c.time_spent || 0), 0);

    // Calculate total CPD hours from passed quizzes
    const totalCPDHours = completions
      .filter(c => c.passed)
      .reduce((total, completion) => {
        // Use episode duration if available, otherwise estimate based on typical podcast length
        const episodeDuration = completion.episode_duration || 0;
        let hours = 0;
        
        if (episodeDuration > 0) {
          // Convert seconds to hours, minimum 0.5 hours
          hours = Math.max(0.5, episodeDuration / 3600);
        } else {
          // Estimate based on typical veterinary podcast length
          // Most veterinary podcasts are 30-45 minutes, so use 0.75 hours (45 minutes) as default
          hours = 0.75;
        }
        
        return total + hours;
      }, 0);

    return {
      totalQuizzes,
      totalPassed,
      averageScore,
      totalTimeSpent,
      totalCPDHours,
      streakDays: calculateStreakDays(completions),
      recentActivity: completions.slice(-5).reverse(),
      achievements: calculateAchievements(completions)
    };
  }, [completions, ...dependencies]);
};

const calculateStreakDays = (completions: any[]): number => {
  if (!completions || completions.length === 0) return 0;
  
  const sortedDates = completions
    .map(c => new Date(c.completed_at).toDateString())
    .sort()
    .filter((date, index, arr) => arr.indexOf(date) === index);

  let streak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      streak = Math.max(streak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return streak;
};

const calculateAchievements = (completions: any[]): any[] => {
  const achievements = [];
  
  if (completions.length >= 1) {
    achievements.push({
      id: 'first-quiz',
      name: 'First Steps',
      description: 'Completed your first quiz',
      icon: '🎯',
      earned_at: completions[0].completed_at
    });
  }
  
  if (completions.length >= 5) {
    achievements.push({
      id: 'quiz-streak-5',
      name: 'Quiz Enthusiast',
      description: 'Completed 5 quizzes',
      icon: '🔥',
      earned_at: completions[4].completed_at
    });
  }
  
  if (completions.length >= 10) {
    achievements.push({
      id: 'quiz-streak-10',
      name: 'Learning Master',
      description: 'Completed 10 quizzes',
      icon: '🏆',
      earned_at: completions[9].completed_at
    });
  }
  
  const perfectScores = completions.filter(c => c.percentage === 100);
  if (perfectScores.length >= 3) {
    achievements.push({
      id: 'perfect-scores',
      name: 'Triple Trouble',
      description: 'Completed three quizzes',
      icon: '⭐',
      earned_at: perfectScores[2].completed_at
    });
  }
  
  return achievements;
};

export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

export const useEventCallback = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  const ref = useRef<T>(fn);
  
  useEffect(() => {
    ref.current = fn;
  });
  
  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, []) as T;
};

export const useMemoizedId = (prefix: string, suffix?: string) => {
  return useMemo(() => {
    const id = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    return suffix ? `${id}-${suffix}` : id;
  }, [prefix, suffix]);
};

export const createMemoizedSelector = <TState, TResult>(
  selector: (state: TState) => TResult,
  equalityFn?: (prev: TResult, next: TResult) => boolean
) => {
  let lastResult: TResult;
  let lastState: TState;
  
  return (state: TState): TResult => {
    if (state !== lastState) {
      const nextResult = selector(state);
      
      if (equalityFn) {
        if (!equalityFn(lastResult, nextResult)) {
          lastResult = nextResult;
        }
      } else if (lastResult !== nextResult) {
        lastResult = nextResult;
      }
      
      lastState = state;
    }
    
    return lastResult;
  };
};

export const useDebouncedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T => {
  const [debouncedDeps, setDebouncedDeps] = React.useState(deps);
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedDeps(deps);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, deps);
  
  return useMemo(factory, debouncedDeps);
};

export const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
};

export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (!obj1 || !obj2) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}

export const profileComponent = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  name: string
): React.ComponentType<T> => {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }
  
  const ProfiledComponent = (props: T) => {
    const renderStart = useRef<number>();
    
    useEffect(() => {
      renderStart.current = performance.now();
    });
    
    useEffect(() => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        console.log(`[Component Render] ${name}: ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(Component, props);
  };
  
  return React.memo(ProfiledComponent) as React.ComponentType<T>;
};