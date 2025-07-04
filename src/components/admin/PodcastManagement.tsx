import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import FileUpload from '../FileUpload';

interface QuizQuestion {
  id: string;
  title: string;
  question_number?: number;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string | null;
  thumbnail_path: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  episode_number?: number;
  season?: number;
  duration?: number; // in seconds
  slug?: string;
  published?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
  show_notes?: string;
  transcript?: string;
  file_size?: number;
  meta_title?: string;
  meta_description?: string;
  full_audio_url?: string;
  quiz_id?: string;
  quiz_questions?: QuizQuestion;
}

interface EpisodeFormData {
  title: string;
  description: string;
  audio_url: string;
  thumbnail_path: string;
  image_url?: string;
  published_at: string;
  // Enhanced fields
  episode_number: number | '';
  season: number;
  duration: number | string; // in seconds or time string
  slug: string;
  published: boolean;
  featured: boolean;
  category: string;
  tags: string[];
  show_notes: string;
  transcript: string;
  meta_title: string;
  meta_description: string;
  full_audio_url: string;
  quiz_id: string;
}

export default function PodcastManagement() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EpisodeFormData>({
    title: '',
    description: '',
    audio_url: '',
    thumbnail_path: '',
    image_url: '',
    published_at: new Date().toISOString().slice(0, 16),
    // Enhanced fields
    episode_number: '',
    season: 1,
    duration: '',
    slug: '',
    published: false,
    featured: false,
    category: '',
    tags: [],
    show_notes: '',
    transcript: '',
    meta_title: '',
    meta_description: '',
    full_audio_url: '',
    quiz_id: ''
  });

  useEffect(() => {
    fetchEpisodes();
    fetchQuizzes();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDuration = (timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/podcast-admin/episodes');
      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }

      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      // Use the working admin API that we just verified
      const response = await fetch('/api/admin/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      
      // Transform the quiz data to match the expected format for the dropdown
      const quizOptions = data.map((quiz: any) => ({
        id: quiz.id,
        title: `${quiz.title} (${quiz.quiz_questions?.length || 0} questions)`,
        question_number: null
      }));
      
      setQuizzes(quizOptions);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      // Set empty array as fallback
      setQuizzes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const slug = formData.slug || generateSlug(formData.title);
      const episodeData = {
        ...formData,
        slug,
        episode_number: formData.episode_number === '' ? null : formData.episode_number,
        duration: formData.duration === '' ? null : formData.duration,
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      const url = editingEpisode 
        ? `/api/podcast-admin/episodes/${editingEpisode.id}`
        : '/api/podcast-admin/episodes';
      
      const method = editingEpisode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(episodeData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save episode: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // Show success message
      setError(`✅ Episode ${editingEpisode ? 'updated' : 'created'} successfully!`);
      
      // Refresh the episodes list
      await fetchEpisodes();
      
      // Close the form after a brief delay to show success message
      setTimeout(() => {
        handleCancel();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save episode');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setFormData({
      title: episode.title,
      description: episode.description,
      audio_url: episode.audio_url,
      thumbnail_path: episode.thumbnail_path,
      image_url: episode.image_url || '',
      published_at: episode.published_at 
        ? new Date(episode.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      // Enhanced fields
      episode_number: episode.episode_number || '',
      season: episode.season || 1,
      duration: episode.duration || '',
      slug: episode.slug || '',
      published: episode.published || false,
      featured: episode.featured || false,
      category: episode.category || '',
      tags: episode.tags || [],
      show_notes: episode.show_notes || '',
      transcript: episode.transcript || '',
      meta_title: episode.meta_title || '',
      meta_description: episode.meta_description || '',
      full_audio_url: episode.full_audio_url || '',
      quiz_id: episode.quiz_id || ''
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) {
      return;
    }

    try {
      const response = await fetch(`/api/podcast-admin/episodes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete episode');
      }

      await fetchEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete episode');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEpisode(null);
    setFormData({
      title: '',
      description: '',
      audio_url: '',
      thumbnail_path: '',
      image_url: '',
      published_at: new Date().toISOString().slice(0, 16),
      // Enhanced fields
      episode_number: '',
      season: 1,
      duration: '',
      slug: '',
      published: false,
      featured: false,
      category: '',
      tags: [],
      show_notes: '',
      transcript: '',
      meta_title: '',
      meta_description: '',
      full_audio_url: '',
      quiz_id: ''
    });
    setError(null);
  };

  const handleCreateNew = () => {
    setEditingEpisode(null);
    setFormData({
      title: '',
      description: '',
      audio_url: '',
      thumbnail_path: '',
      image_url: '',
      published_at: new Date().toISOString().slice(0, 16),
      // Enhanced fields
      episode_number: '',
      season: 1,
      duration: '',
      slug: '',
      published: false,
      featured: false,
      category: '',
      tags: [],
      show_notes: '',
      transcript: '',
      meta_title: '',
      meta_description: '',
      full_audio_url: '',
      quiz_id: ''
    });
    setShowForm(true);
    setError(null);
  };

  const handleMigration = async () => {
    setMigrating(true);
    setError(null);

    try {
      const response = await fetch('/api/add-quiz-column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        setError(`✅ ${result.message}`);
        await fetchEpisodes();
      } else {
        // Show detailed migration instructions
        setError(
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Manual Migration Required</h3>
            <p className="text-yellow-700 mb-3">{result.instruction}</p>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono whitespace-pre-wrap mb-3">
              {result.sql}
            </div>
            <ol className="text-yellow-700 text-sm space-y-1">
              {result.steps?.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {result.supabaseUrl && (
              <a 
                href={result.supabaseUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Open Supabase SQL Editor
              </a>
            )}
          </div>
        );
      }
    } catch (err: any) {
      setError(`Migration check failed: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThumbnailUrl = (thumbnailPath: string) => {
    if (!thumbnailPath) return null;
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(thumbnailPath);
    return data.publicUrl;
  };

  const handleAudioUpload = (url: string, path: string) => {
    setFormData({ ...formData, audio_url: url });
    setError('');
    // Clear any previous errors and show success
  };

  const handleAudioUploadError = (error: string) => {
    setError(`Audio upload failed: ${error}`);
    // Auto-clear error after 10 seconds
    setTimeout(() => {
      if (error.includes('Audio upload failed')) {
        setError('');
      }
    }, 10000);
  };

  const handleImageUpload = (url: string, path: string) => {
    // Store the full path for thumbnail_path (API expects the path for storage)
    // But also store the URL for immediate display
    setFormData({ ...formData, thumbnail_path: path, image_url: url });
    setError('');
    // Clear any previous errors and show success
  };

  const handleImageUploadError = (error: string) => {
    setError(`Thumbnail upload failed: ${error}`);
    // Auto-clear error after 10 seconds
    setTimeout(() => {
      if (error.includes('Thumbnail upload failed')) {
        setError('');
      }
    }, 10000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Podcast Management</h2>
          <p className="text-gray-600 mt-1">Manage your podcast episodes</p>
        </div>
        <div className="flex space-x-3">
          {error && typeof error === 'string' && error.includes('Failed to fetch episodes') && (
            <button
              onClick={handleMigration}
              disabled={migrating}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {migrating ? 'Migrating...' : 'Add Quiz Support'}
            </button>
          )}
          {!showForm && (
            <button
              onClick={handleCreateNew}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Episode
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={`border-l-4 rounded-lg p-4 ${
          typeof error === 'string' && error.includes('✅') 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`w-5 h-5 ${
                typeof error === 'string' && error.includes('✅') 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {typeof error === 'string' && error.includes('✅') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                typeof error === 'string' && error.includes('✅') 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                {typeof error === 'string' && error.includes('✅') 
                  ? 'Success!' 
                  : typeof error === 'string' && error.includes('upload') 
                    ? 'Upload Error' 
                    : 'Operation Error'}
              </h3>
              <div className={`text-sm mt-1 ${
                typeof error === 'string' && error.includes('✅') 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>{error}</div>
              {typeof error === 'string' && error.includes('upload') && !error.includes('✅') && (
                <p className="text-xs text-red-600 mt-2">
                  💡 Try: {error.includes('Audio') ? 'Check audio file format (MP3, WAV, M4A) and size (under 100MB)' : 'Check image format (PNG, JPG, WebP) and size (under 5MB)'}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => setError('')}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  typeof error === 'string' && error.includes('✅') 
                    ? 'text-green-400 hover:bg-green-100 focus:ring-green-600' 
                    : 'text-red-400 hover:bg-red-100 focus:ring-red-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingEpisode ? 'Edit Episode' : 'Create New Episode'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Episode Organization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="episode_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Episode Number
                </label>
                <input
                  type="number"
                  id="episode_number"
                  min="1"
                  value={formData.episode_number}
                  onChange={(e) => setFormData({ ...formData, episode_number: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <input
                  type="number"
                  id="season"
                  min="1"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (MM:SS or HH:MM:SS)
                </label>
                <input
                  type="text"
                  id="duration"
                  placeholder="5:30 or 1:05:30"
                  value={formData.duration === '' ? '' : (typeof formData.duration === 'string' ? formData.duration : formatDuration(formData.duration))}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
                      setFormData({ ...formData, duration: parseDuration(value) });
                    } else {
                      setFormData({ ...formData, duration: value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* SEO & URL */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
            </div>

            {/* Publishing Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="mr-2 rounded"
                />
                Published
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2 rounded"
                />
                Featured
              </label>
            </div>

            {/* Category, Tags, and Quiz */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Education, Interview, News"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="quiz_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Quiz
                </label>
                <select
                  id="quiz_id"
                  value={formData.quiz_id}
                  onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No Quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.question_number ? `Q${quiz.question_number}: ` : ''}{quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                  })}
                  placeholder="e.g., veterinary, surgery, tips"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter((_, i) => i !== index),
                            })
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Audio (Short version for initial play)
              </label>
              <FileUpload
                type="audio"
                onUploadSuccess={handleAudioUpload}
                onUploadError={handleAudioUploadError}
                currentValue={formData.audio_url}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Audio (Complete episode for full access)
              </label>
              <FileUpload
                type="audio"
                onUploadSuccess={(url: string, path: string) => {
                  setFormData({ ...formData, full_audio_url: url });
                  setError(null);
                }}
                onUploadError={(error: string) => {
                  setError(`Full audio upload failed: ${error}`);
                  setTimeout(() => {
                    if (error.includes('Full audio upload failed')) {
                      setError(null);
                    }
                  }, 10000);
                }}
                currentValue={formData.full_audio_url}
              />
            </div>

            <div>
              <FileUpload
                type="image"
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageUploadError}
                currentValue={formData.image_url || (formData.thumbnail_path ? getThumbnailUrl(formData.thumbnail_path) : '')}
              />
            </div>

            {/* Show Notes */}
            <div>
              <label htmlFor="show_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Show Notes
              </label>
              <textarea
                id="show_notes"
                rows={6}
                value={formData.show_notes}
                onChange={(e) => setFormData({ ...formData, show_notes: e.target.value })}
                placeholder="Detailed episode content, links, and notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* SEO Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Custom title for search engines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  id="meta_description"
                  rows={3}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Brief description for search engines (160 chars max)"
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 characters</p>
              </div>
            </div>

            <div>
              <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-1">
                Published Date
              </label>
              <input
                type="datetime-local"
                id="published_at"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {saving ? 'Saving...' : editingEpisode ? 'Update Episode' : 'Create Episode'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
            </h3>
          </div>

          {episodes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No episodes found. Create your first podcast episode to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Episode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {episodes.map((episode) => (
                    <tr key={episode.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12">
                          {episode.thumbnail_path ? (
                            <Image
                              src={(episode.image_url ?? getThumbnailUrl(episode.thumbnail_path)) || ''}
                              alt={episode.title}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                              onError={(e: any) => {
                                e.target.src = 'https://placehold.co/64';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            S{episode.season || 1}E{episode.episode_number || '?'}
                          </div>
                          {episode.featured && (
                            <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 mt-1">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 truncate" title={episode.title}>
                            {episode.title}
                          </div>
                          {episode.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2" title={episode.description}>
                              {episode.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {episode.duration ? formatDuration(episode.duration) : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {episode.quiz_questions ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Q{episode.quiz_questions.question_number}: {episode.quiz_questions.title}
                          </span>
                        ) : (
                          <span className="text-gray-400">No Quiz</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                            episode.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {episode.published ? 'Published' : 'Draft'}
                          </span>
                          {episode.audio_url && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 w-fit">
                              Audio
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {episode.published_at ? formatDate(episode.published_at) : 'Not published'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(episode)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(episode.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 