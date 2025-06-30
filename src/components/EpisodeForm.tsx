import { useState, useEffect } from 'react';

interface Episode {
  id?: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
}

interface EpisodeFormProps {
  episode?: Episode;
  onSave: (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EpisodeForm({ episode, onSave, onCancel, isLoading = false }: EpisodeFormProps) {
  const [formData, setFormData] = useState({
    title: episode?.title || '',
    description: episode?.description || '',
    audio_url: episode?.audio_url || '',
    image_url: episode?.image_url || '',
    published_at: episode?.published_at 
      ? new Date(episode.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioInputType, setAudioInputType] = useState<'file' | 'url'>(
    episode?.audio_url ? 'url' : 'file'
  );
  const [audioFiles, setAudioFiles] = useState<Array<{
    name: string;
    displayName: string;
    url: string;
    size: number;
    created_at: string;
  }>>([]);
  const [loadingAudioFiles, setLoadingAudioFiles] = useState(false);

  useEffect(() => {
    if (audioInputType === 'url') {
      fetchAudioFiles();
    }
  }, [audioInputType]);

  const fetchAudioFiles = async () => {
    try {
      setLoadingAudioFiles(true);
      const response = await fetch('/api/audio-files');
      if (response.ok) {
        const data = await response.json();
        setAudioFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching audio files:', error);
    } finally {
      setLoadingAudioFiles(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (audioInputType === 'file' && !audioFile) {
      newErrors.audio_url = 'Please upload an audio file';
    }
    
    if (audioInputType === 'url' && !formData.audio_url) {
      newErrors.audio_url = 'Please provide an audio URL';
    }
    
    if (audioInputType === 'url' && formData.audio_url && !isValidUrl(formData.audio_url)) {
      newErrors.audio_url = 'Please enter a valid URL';
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const uploadAudioFile = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      return data.url;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let finalFormData = { ...formData };

      // Upload audio file if using file input
      if (audioInputType === 'file' && audioFile) {
        const audioUrl = await uploadAudioFile(audioFile);
        finalFormData.audio_url = audioUrl;
      }

      onSave(finalFormData);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ 
        ...prev, 
        audio_url: error instanceof Error ? error.message : 'Failed to upload audio file' 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          audio_url: 'Please select a valid audio file (MP3, WAV, OGG, AAC)' 
        }));
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          audio_url: 'File size must be less than 100MB' 
        }));
        return;
      }

      setAudioFile(file);
      // Clear the URL field when a file is selected
      setFormData(prev => ({ ...prev, audio_url: '' }));
      
      // Clear any existing errors
      if (errors.audio_url) {
        setErrors(prev => ({ ...prev, audio_url: '' }));
      }
    }
  };

  const clearAudioFile = () => {
    setAudioFile(null);
    // Reset the file input
    const fileInput = document.getElementById('audio_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const switchToFileInput = () => {
    setAudioInputType('file');
    setFormData(prev => ({ ...prev, audio_url: '' }));
    if (errors.audio_url) {
      setErrors(prev => ({ ...prev, audio_url: '' }));
    }
  };

  const switchToUrlInput = () => {
    setAudioInputType('url');
    clearAudioFile();
    if (errors.audio_url) {
      setErrors(prev => ({ ...prev, audio_url: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {episode ? 'Edit Episode' : 'Create New Episode'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.title 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            placeholder="Enter episode title"
            disabled={isLoading}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter episode description"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Audio Source
          </label>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={switchToFileInput}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                audioInputType === 'file'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading || uploading}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={switchToUrlInput}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                audioInputType === 'url'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading || uploading}
            >
              Select Existing
            </button>
          </div>

          {/* File Upload Tab */}
          {audioInputType === 'file' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="audio_file" className="block text-sm text-gray-600 mb-2">
                  Choose Audio File (MP3, WAV, OGG, AAC - Max 100MB)
                </label>
                <input
                  type="file"
                  id="audio_file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading || uploading}
                />
                {audioFile && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-700">
                      Selected: {audioFile.name} ({Math.round(audioFile.size / 1024 / 1024 * 100) / 100} MB)
                    </p>
                    <button
                      type="button"
                      onClick={clearAudioFile}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Select Existing Audio Tab */}
          {audioInputType === 'url' && (
            <div>
              <label htmlFor="audio_url" className="block text-sm text-gray-600 mb-2">
                Select from uploaded audio files
              </label>
              
              {loadingAudioFiles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Loading audio files...</div>
                </div>
              ) : audioFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No audio files found.</p>
                  <p className="text-sm mt-1">Upload files using the "Upload File" tab first.</p>
                </div>
              ) : (
                <select
                  id="audio_url"
                  name="audio_url"
                  value={formData.audio_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    errors.audio_url 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  disabled={isLoading || uploading}
                >
                  <option value="">Select an audio file...</option>
                  {audioFiles.map((file) => (
                    <option key={file.url} value={file.url}>
                      {file.displayName} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)
                    </option>
                  ))}
                </select>
              )}

              {formData.audio_url && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    Selected: {audioFiles.find(f => f.url === formData.audio_url)?.displayName || 'Audio file'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, audio_url: '' }))}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={uploading}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
          
          {errors.audio_url && <p className="mt-1 text-sm text-red-600">{errors.audio_url}</p>}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.image_url 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            placeholder="https://example.com/image.jpg"
            disabled={isLoading}
          />
          {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>}
        </div>

        <div>
          <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-1">
            Published Date
          </label>
          <input
            type="datetime-local"
            id="published_at"
            name="published_at"
            value={formData.published_at || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || uploading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : isLoading ? 'Saving...' : episode ? 'Update Episode' : 'Create Episode'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || uploading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}