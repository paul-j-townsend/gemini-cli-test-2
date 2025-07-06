import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FileSelector from './FileSelector';

interface FileUploadProps {
  type: 'image' | 'audio';
  onUploadSuccess: (url: string, path: string) => void;
  onUploadError: (error: string) => void;
  currentValue?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  onUploadSuccess,
  onUploadError,
  currentValue,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = type === 'image' 
    ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    : ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];

  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB for images, 100MB for audio

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Please upload ${type === 'image' ? 'an image (JPG, PNG, GIF, WebP)' : 'an audio file (MP3, WAV, M4A, OGG)'}.`);
    }
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`File too large. Maximum size is ${sizeMB}MB. Your file is ${formatFileSize(file.size)}.`);
    }
  };

  const clearMessages = () => {
    setSuccessMessage('');
    onUploadError('');
  };

  const createPreview = (file: File) => {
    if (type === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      clearMessages();
      validateFile(file);

      // Generate unique filename
      const timestamp = new Date().toISOString().split('T')[0];
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop()?.toLowerCase();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, "");
      const fileName = `${timestamp}_${cleanName}_${randomString}.${extension}`;
      
      // Determine storage bucket and path
      const bucket = type === 'image' ? 'images' : 'audio';
      const folder = type === 'image' ? 'article-images' : 'podcasts';
      const filePath = `${folder}/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + Math.random() * 20;
          return prev;
        });
      }, 200);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Success
      setSuccessMessage(`✅ ${type === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);
      onUploadSuccess(urlData.publicUrl, filePath);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error: any) {
      setUploadProgress(0);
      let errorMessage = error.message;
      
      // Enhanced error messages
      if (error.message?.includes('Duplicate')) {
        errorMessage = 'A file with this name already exists. Please rename your file or try again.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Storage error occurred. Please check your connection and try again.';
      } else if (error.message?.includes('413')) {
        errorMessage = 'File too large for upload. Please choose a smaller file.';
      }
      
      onUploadError(errorMessage);
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      createPreview(file);
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      createPreview(file);
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!uploading) {
      clearMessages();
      fileInputRef.current?.click();
    }
  };

  const handleFileFromSelector = (url: string, path: string) => {
    onUploadSuccess(url, path);
    setSuccessMessage(`✅ ${type === 'image' ? 'Image' : 'Audio'} selected successfully!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Browse existing files button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          {type === 'image' ? 'Article Image' : 'Audio File'}
        </h4>
        <button
          type="button"
          onClick={() => setShowFileSelector(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Browse existing files
        </button>
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50 scale-[1.02]' : 'border-gray-300'}
          ${uploading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 hover:bg-gray-50'}
          ${successMessage ? 'border-green-400 bg-green-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center space-y-3">
            {/* Progress indicator */}
            <div className="w-16 h-16 relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div 
                className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent absolute top-0 animate-spin"
                style={{
                  background: `conic-gradient(#2563eb ${uploadProgress * 3.6}deg, transparent 0deg)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Uploading {selectedFile?.name}...
              </p>
              <p className="text-xs text-gray-500">
                {selectedFile && formatFileSize(selectedFile.size)}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : successMessage ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 mx-auto">
              {type === 'image' ? (
                <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                </svg>
              ) : (
                <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l4-4h20l4 4v13M9 19l3 3h24l3-3M9 19v19a2 2 0 002 2h26a2 2 0 002-2V19M9 19h30M15 15h6m6 0h6" />
                </svg>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Drop your {type} here or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-500">
                {type === 'image' 
                  ? 'PNG, JPG, GIF, WebP up to 5MB' 
                  : 'MP3, WAV, M4A, OGG up to 100MB'
                }
              </p>
            </div>
          </div>
        )}

        {/* Preview for images */}
        {previewUrl && type === 'image' && (
          <div className="mt-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-32 max-h-32 mx-auto rounded-lg object-cover border-2 border-gray-200"
            />
          </div>
        )}
      </div>
      
      {/* Current file display */}
      {currentValue && !uploading && !successMessage && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          {type === 'image' ? (
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 relative">
                <img
                  src={currentValue}
                  alt="Current image"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e: any) => {
                    // Hide the broken image and show fallback
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-image');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="fallback-image w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0 border border-gray-200" style={{display: 'none'}}>
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Current image:</p>
                <p className="text-sm text-gray-500 truncate" title={currentValue}>
                  {currentValue.split('/').pop() || currentValue}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l4-4h6a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Current audio:</p>
                <p className="text-sm text-gray-500 truncate" title={currentValue}>
                  {currentValue.split('/').pop() || currentValue}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Selector Modal */}
      {showFileSelector && (
        <FileSelector
          type={type}
          onFileSelect={handleFileFromSelector}
          onClose={() => setShowFileSelector(false)}
          currentValue={currentValue}
        />
      )}
    </div>
  );
};

export default FileUpload; 