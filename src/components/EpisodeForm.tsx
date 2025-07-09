import { useState, useEffect } from 'react';
import Badge from './Badge';
import { FaAward } from 'react-icons/fa';

interface Episode {
  id?: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_path: string;
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
    thumbnail_path: episode?.thumbnail_path || '',
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputType, setImageInputType] = useState<'file' | 'existing'>(
    episode?.thumbnail_path ? 'existing' : 'file'
  );
  const [imageFiles, setImageFiles] = useState<Array<{
    name: string;
    displayName: string;
    url: string;
    path: string;
    size: number;
    created_at: string;
  }>>([]);
  const [loadingImageFiles, setLoadingImageFiles] = useState(false);
  const [badge, setBadge] = useState({
    name: 'Test Badge',
    description: 'This is a test badge',
    icon: <FaAward />,
    color: '#FFD700'
  });

  useEffect(() => {
    if (audioInputType === 'url') {
      fetchAudioFiles();
    }
  }, [audioInputType]);

  useEffect(() => {
    if (imageInputType === 'existing') {
      fetchImageFiles();
    }
  }, [imageInputType]);

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

  const fetchImageFiles = async () => {
    try {
      setLoadingImageFiles(true);
      const response = await fetch('/api/image-files');
      if (response.ok) {
        const data = await response.json();
        setImageFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching image files:', error);
    } finally {
      setLoadingImageFiles(false);
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
    
    // Require thumbnail for new episodes or if current episode doesn't have one
    if (!episode?.thumbnail_path && imageInputType === 'file' && !imageFile) {
      newErrors.thumbnail_path = 'Please upload a thumbnail image';
    }
    
    if (imageInputType === 'existing' && !formData.thumbnail_path) {
      newErrors.thumbnail_path = 'Please select an existing thumbnail image';
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

  const uploadImageFile = async (file: File): Promise<string> => {
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.path; // Return the path instead of the URL
    } finally {
      setUploadingImage(false);
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

      // Upload image file if provided, or use existing image path
      if (imageInputType === 'file' && imageFile) {
        const imagePath = await uploadImageFile(imageFile);
        finalFormData.thumbnail_path = imagePath;
      }
      // For existing images, thumbnail_path is already set in formData

      onSave(finalFormData);
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof Error && error.message.includes('image')) {
        setErrors(prev => ({ 
          ...prev, 
          thumbnail_path: error.message
        }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          audio_url: error instanceof Error ? error.message : 'Failed to upload file' 
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          thumbnail_path: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' 
        }));
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          thumbnail_path: 'Image size must be less than 10MB' 
        }));
        return;
      }

      setImageFile(file);
      
      // Clear any existing errors
      if (errors.thumbnail_path) {
        setErrors(prev => ({ ...prev, thumbnail_path: '' }));
      }
    }
  };

  const clearImageFile = () => {
    setImageFile(null);
    // Reset the file input
    const fileInput = document.getElementById('image_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Episode Thumbnail
          </label>
          <p className="text-sm text-gray-500 mb-3">Choose an image file or select from existing thumbnails</p>
          
          {/* Image Input Type Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setImageInputType('file')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                imageInputType === 'file'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading || uploadingImage}
            >
              Upload New
            </button>
            <button
              type="button"
              onClick={() => setImageInputType('existing')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ml-4 ${
                imageInputType === 'existing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading || uploadingImage}
            >
              Select Existing
            </button>
          </div>

          {imageInputType === 'file' && (
            <input
              type="file"
              id="image_file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading || uploadingImage}
            />
          )}

          {imageInputType === 'existing' && (
            <div>
              <label htmlFor="existing_image" className="block text-sm text-gray-600 mb-2">
                Select from uploaded thumbnail images
              </label>
              
              {loadingImageFiles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Loading thumbnail images...</div>
                </div>
              ) : imageFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No thumbnail images found.</p>
                  <p className="text-sm mt-1">Upload files using the "Upload New" tab first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageFiles.map((file) => (
                    <div
                      key={file.path}
                      className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${
                        formData.thumbnail_path === file.path
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, thumbnail_path: file.path }));
                        if (errors.thumbnail_path) {
                          setErrors(prev => ({ ...prev, thumbnail_path: '' }));
                        }
                      }}
                    >
                      <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={file.url}
                          alt={file.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate" title={file.displayName}>
                        {file.displayName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.round(file.size / 1024)} KB
                      </p>
                      {formData.thumbnail_path === file.path && (
                        <div className="absolute top-1 right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.thumbnail_path && imageInputType === 'existing' && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    Selected: {imageFiles.find(f => f.path === formData.thumbnail_path)?.displayName || 'Image file'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail_path: '' }))}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={uploadingImage}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
          
          {imageInputType === 'file' && imageFile && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-700">
                  Selected: {imageFile.name} ({Math.round(imageFile.size / 1024 * 100) / 100} KB)
                </p>
                <button
                  type="button"
                  onClick={clearImageFile}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  disabled={uploadingImage}
                >
                  Remove
                </button>
              </div>

              {/* Image Preview */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Show existing thumbnail if editing and using file input */}
          {imageInputType === 'file' && episode?.thumbnail_path && !imageFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
              <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${episode.thumbnail_path}`}
                  alt="Current thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadingImage && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading thumbnail...</p>
            </div>
          )}
          
          {errors.thumbnail_path && <p className="mt-1 text-sm text-red-600">{errors.thumbnail_path}</p>}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Badge
          </label>
          <Badge
            name={badge.name}
            description={badge.description}
            icon={badge.icon}
            color={badge.color}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || uploading || uploadingImage}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImage ? 'Uploading Image...' : uploading ? 'Uploading Audio...' : isLoading ? 'Saving...' : episode ? 'Update Episode' : 'Create Episode'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || uploading || uploadingImage}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}