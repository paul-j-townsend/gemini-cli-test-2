import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for persisting state to localStorage with TypeScript support
 * @param key - The key to use for localStorage
 * @param defaultValue - The default value to use if no stored value exists
 * @param options - Configuration options
 * @returns [state, setState] tuple similar to useState
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    errorFallback?: T;
  } = {}
): [T, (value: T | ((prevState: T) => T)) => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    errorFallback = defaultValue,
  } = options;

  // Initialize state from localStorage or use default
  const [state, setState] = useState<T>(() => {
    // Return default value during SSR
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return errorFallback;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state, serialize]);

  // Wrapper function to handle functional updates
  const setPersistedState = useCallback((value: T | ((prevState: T) => T)) => {
    setState(value);
  }, []);

  return [state, setPersistedState];
}

/**
 * Hook for persisting quiz progress to localStorage
 * @param quizId - The ID of the quiz
 * @returns Quiz progress state and setter
 */
export function useQuizProgress(quizId: string) {
  const [progress, setProgress] = usePersistedState(
    `quiz_progress_${quizId}`,
    {
      currentQuestionIndex: 0,
      answers: {} as Record<string, string[]>,
      startTime: Date.now(),
      lastUpdated: Date.now(),
    },
    {
      errorFallback: {
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
      },
    }
  );

  const updateProgress = useCallback((updates: Partial<typeof progress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now(),
    }));
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress({
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      lastUpdated: Date.now(),
    });
  }, [setProgress]);

  return {
    progress,
    updateProgress,
    resetProgress,
  };
}

/**
 * Hook for persisting form data to localStorage
 * @param formId - Unique identifier for the form
 * @param initialData - Initial form data
 * @returns Form data state and utilities
 */
export function useFormPersistence<T extends Record<string, any>>(
  formId: string,
  initialData: T
) {
  const [formData, setFormData] = usePersistedState(
    `form_data_${formId}`,
    initialData,
    {
      errorFallback: initialData,
    }
  );

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, [setFormData]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, [setFormData]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [setFormData, initialData]);

  const clearPersistedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(`form_data_${formId}`);
      } catch (error) {
        console.warn(`Error clearing form data for "${formId}":`, error);
      }
    }
    resetForm();
  }, [formId, resetForm]);

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    clearPersistedData,
  };
}

/**
 * Hook for persisting user preferences
 * @returns User preferences state and utilities
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = usePersistedState(
    'user_preferences',
    {
      theme: 'light' as 'light' | 'dark',
      autoSave: true,
      showHints: true,
      autoPlay: false,
      volume: 1.0,
      playbackSpeed: 1.0,
      preferredLanguage: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      errorFallback: {
        theme: 'light' as 'light' | 'dark',
        autoSave: true,
        showHints: true,
        autoPlay: false,
        volume: 1.0,
        playbackSpeed: 1.0,
        preferredLanguage: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
  );

  const updatePreference = useCallback((key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'light',
      autoSave: true,
      showHints: true,
      autoPlay: false,
      volume: 1.0,
      playbackSpeed: 1.0,
      preferredLanguage: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}

/**
 * Hook for persisting recent activity/history
 * @param maxItems - Maximum number of items to keep in history
 * @returns History state and utilities
 */
export function useActivityHistory<T>(maxItems: number = 10) {
  const [history, setHistory] = usePersistedState<T[]>(
    'activity_history',
    [],
    {
      errorFallback: [],
    }
  );

  const addToHistory = useCallback((item: T) => {
    setHistory(prev => {
      const newHistory = [item, ...prev.filter(historyItem => 
        JSON.stringify(historyItem) !== JSON.stringify(item)
      )];
      return newHistory.slice(0, maxItems);
    });
  }, [setHistory, maxItems]);

  const removeFromHistory = useCallback((item: T) => {
    setHistory(prev => prev.filter(historyItem => 
      JSON.stringify(historyItem) !== JSON.stringify(item)
    ));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

/**
 * Hook for persisting draft content (e.g., unsaved form data)
 * @param draftId - Unique identifier for the draft
 * @returns Draft state and utilities
 */
export function useDraftPersistence<T>(draftId: string) {
  const [draft, setDraft] = usePersistedState<T | null>(
    `draft_${draftId}`,
    null,
    {
      errorFallback: null,
    }
  );

  const saveDraft = useCallback((data: T) => {
    setDraft(data);
  }, [setDraft]);

  const clearDraft = useCallback(() => {
    setDraft(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(`draft_${draftId}`);
      } catch (error) {
        console.warn(`Error clearing draft "${draftId}":`, error);
      }
    }
  }, [draftId, setDraft]);

  const hasDraft = draft !== null;

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  };
}

/**
 * Utility function to clear all VetSidekick persisted data
 */
export function clearAllPersistedData() {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(window.localStorage);
    const vetsidekickKeys = keys.filter(key => 
      key.startsWith('quiz_progress_') ||
      key.startsWith('form_data_') ||
      key.startsWith('draft_') ||
      key === 'user_preferences' ||
      key === 'activity_history'
    );

    vetsidekickKeys.forEach(key => {
      window.localStorage.removeItem(key);
    });

    console.log(`Cleared ${vetsidekickKeys.length} persisted data items`);
  } catch (error) {
    console.warn('Error clearing persisted data:', error);
  }
}

export default usePersistedState;