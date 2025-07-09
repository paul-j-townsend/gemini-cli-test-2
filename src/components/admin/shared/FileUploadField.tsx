import React from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

interface FileUploadFieldProps {
  label: string;
  type: 'image' | 'audio';
  value?: string;
  onChange: (url: string, path: string) => void;
  onError?: (error: string) => void;
  required?: boolean;
  className?: string;
  helpText?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  type,
  value,
  onChange,
  onError,
  required = false,
  className = '',
  helpText
}) => {
  const {
    uploading,
    progress,
    error,
    uploadFile,
    clearError
  } = useFileUpload({
    type,
    onSuccess: onChange,
    onError: onError
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'image' ? 'image/*' : 'audio/*'}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          loading={uploading}
        >
          {uploading ? `Uploading... ${progress}%` : `Upload ${label}`}
        </Button>

        {value && (
          <span className="text-sm text-green-600">
            ✓ {type === 'image' ? 'Image' : 'Audio'} uploaded
          </span>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          className="mt-2"
        />
      )}

      {value && type === 'image' && (
        <div className="mt-3">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
};

export default FileUploadField;