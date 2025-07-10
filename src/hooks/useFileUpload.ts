import { useState, useCallback } from 'react';

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  path: string | null;
}

export interface FileUploadOptions {
  type: 'image' | 'audio';
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string, path: string) => void;
  onError?: (error: string) => void;
}

export interface FileUploadActions {
  uploadFile: (file: File) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export interface FileUploadHook extends FileUploadState, FileUploadActions {}

/**
 * Hook for handling file uploads with progress tracking and error handling
 * Provides consistent file upload functionality for admin interfaces
 * 
 * @param options - Configuration for file upload behavior
 * @returns Object containing upload state and actions
 * 
 * @example
 * ```typescript
 * const {
 *   uploading,
 *   progress,
 *   error,
 *   url,
 *   uploadFile,
 *   reset,
 *   clearError
 * } = useFileUpload({
 *   type: 'image',
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
 *   onSuccess: (url, path) => {
 *     console.log('Upload successful:', url);
 *   },
 *   onError: (error) => {
 *     console.error('Upload failed:', error);
 *   }
 * });
 * ```
 */
export const useFileUpload = (options: FileUploadOptions): FileUploadHook => {
  const {
    type,
    maxSize = type === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024, // 5MB for images, 100MB for audio
    allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'],
    onProgress,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null,
    path: null,
  });

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!file) {
      return 'Please select a file';
    }

    if (!allowedTypes.includes(file.type)) {
      const friendlyTypes = allowedTypes.map(type => {
        switch (type) {
          case 'image/jpeg':
          case 'image/jpg':
            return 'JPG';
          case 'image/png':
            return 'PNG';
          case 'image/webp':
            return 'WebP';
          case 'audio/mpeg':
          case 'audio/mp3':
            return 'MP3';
          case 'audio/wav':
            return 'WAV';
          case 'audio/m4a':
            return 'M4A';
          default:
            return type.split('/')[1]?.toUpperCase() || type;
        }
      });
      const uniqueTypes = [...new Set(friendlyTypes)];
      return `Please choose a ${uniqueTypes.join(', ')} file. The selected file type is not supported.`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  }, [allowedTypes, maxSize]);

  /**
   * Upload a file to the server
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      onError?.(validationError);
      return;
    }

    setState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
      url: null,
      path: null,
    }));

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload file with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const { url, path } = result.data;

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        url,
        path,
        error: null,
      }));

      onSuccess?.(url, path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
        path: null,
      }));

      onError?.(errorMessage);
    }
  }, [type, validateFile, onSuccess, onError]);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      url: null,
      path: null,
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    uploadFile,
    reset,
    clearError,
  };
};

export default useFileUpload;