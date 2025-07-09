import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface LoadingStateActions {
  execute: <T>(asyncOperation: () => Promise<T>) => Promise<T | null>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (data: any) => void;
  clearError: () => void;
  reset: () => void;
}

export interface LoadingStateConfig {
  initialLoading?: boolean;
  initialError?: string | null;
  initialData?: any;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export interface LoadingStateHook extends LoadingState, LoadingStateActions {
  retry: () => Promise<void>;
  canRetry: boolean;
  attemptCount: number;
}

/**
 * Hook for consistent loading state management with error handling and retry logic
 * Provides standardized async operation handling across the application
 * 
 * @param config - Configuration object for the loading state
 * @returns Object containing loading state and actions
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { isLoading, error, data, execute } = useLoadingState();
 * 
 * const handleFetchData = async () => {
 *   const result = await execute(async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   });
 *   
 *   if (result) {
 *     console.log('Data loaded:', result);
 *   }
 * };
 * 
 * // With configuration
 * const { isLoading, error, execute, retry, canRetry } = useLoadingState({
 *   retryAttempts: 3,
 *   retryDelay: 1000,
 *   onError: (error) => console.error('Operation failed:', error),
 *   onSuccess: (data) => console.log('Operation succeeded:', data)
 * });
 * ```
 */
export const useLoadingState = (config: LoadingStateConfig = {}): LoadingStateHook => {
  const {
    initialLoading = false,
    initialError = null,
    initialData = null,
    retryAttempts = 0,
    retryDelay = 1000,
    onError,
    onSuccess,
    onLoadingChange,
  } = config;

  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  const [data, setData] = useState<any>(initialData);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Store the last operation for retry functionality
  const lastOperationRef = useRef<(() => Promise<any>) | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Set loading state with optional callback
   */
  const setLoadingState = useCallback((loading: boolean) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  /**
   * Set error state
   */
  const setErrorState = useCallback((errorValue: string | null) => {
    if (!isMountedRef.current) return;
    
    setError(errorValue);
  }, []);

  /**
   * Set data state
   */
  const setDataState = useCallback((dataValue: any) => {
    if (!isMountedRef.current) return;
    
    setData(dataValue);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, [setErrorState]);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsLoading(initialLoading);
    setError(initialError);
    setData(initialData);
    setAttemptCount(0);
    lastOperationRef.current = null;
  }, [initialLoading, initialError, initialData]);

  /**
   * Execute an async operation with loading state management
   */
  const execute = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T | null> => {
    if (!isMountedRef.current) return null;
    
    // Store the operation for potential retry
    lastOperationRef.current = asyncOperation;
    
    setLoadingState(true);
    setErrorState(null);
    setAttemptCount(prev => prev + 1);

    try {
      const result = await asyncOperation();
      
      if (!isMountedRef.current) return null;
      
      setDataState(result);
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      if (!isMountedRef.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setErrorState(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
      
      console.error('useLoadingState: Operation failed:', err);
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoadingState(false);
      }
    }
  }, [setLoadingState, setErrorState, setDataState, onError, onSuccess]);

  /**
   * Retry the last operation with exponential backoff
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!lastOperationRef.current || attemptCount >= retryAttempts) {
      return;
    }

    // Calculate delay with exponential backoff
    const delay = retryDelay * Math.pow(2, attemptCount - 1);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (!isMountedRef.current) return;
    
    await execute(lastOperationRef.current);
  }, [attemptCount, retryAttempts, retryDelay, execute]);

  /**
   * Execute with automatic retry logic
   */
  const executeWithRetry = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T | null> => {
    let currentAttempt = 0;
    let lastError: Error | null = null;

    while (currentAttempt <= retryAttempts) {
      try {
        return await execute(asyncOperation);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        currentAttempt++;
        
        if (currentAttempt <= retryAttempts) {
          const delay = retryDelay * Math.pow(2, currentAttempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we get here, all retries failed
    if (lastError) {
      throw lastError;
    }

    return null;
  }, [execute, retryAttempts, retryDelay]);

  // Determine if retry is possible
  const canRetry = attemptCount > 0 && attemptCount < retryAttempts && lastOperationRef.current !== null;

  return {
    // State
    isLoading,
    error,
    data,
    attemptCount,
    canRetry,
    
    // Actions
    execute,
    setLoading: setLoadingState,
    setError: setErrorState,
    setData: setDataState,
    clearError,
    reset,
    retry,
  };
};

/**
 * Simplified version for basic loading states without retry logic
 */
export const useSimpleLoadingState = (initialLoading: boolean = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncOperation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('useSimpleLoadingState: Operation failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    clearError,
    setLoading: setIsLoading,
    setError,
  };
};

export default useLoadingState;