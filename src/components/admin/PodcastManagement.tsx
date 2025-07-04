import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import FileUpload from '../FileUpload';

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
}

interface EpisodeFormData {
  title: string;
  description: string;
  audio_url: string;
  thumbnail_path: string;
  image_url?: string;
  published_at: string;
}

export default function PodcastManagement() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EpisodeFormData>({
    title: '',
    description: '',
    audio_url: '',
    thumbnail_path: '',
    image_url: '',
    published_at: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    fetchEpisodes();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = editingEpisode 
        ? `/api/podcast-admin/episodes/${editingEpisode.id}`
        : '/api/podcast-admin/episodes';
      
      const method = editingEpisode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save episode');
      }

      await fetchEpisodes();
      handleCancel();
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
        : new Date().toISOString().slice(0, 16)
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
      published_at: new Date().toISOString().slice(0, 16)
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
      published_at: new Date().toISOString().slice(0, 16)
    });
    setShowForm(true);
    setError(null);
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
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Episode
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {error.includes('upload') ? 'Upload Error' : 'Operation Error'}
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('upload') && (
                <p className="text-xs text-red-600 mt-2">
                  💡 Try: {error.includes('Audio') ? 'Check audio file format (MP3, WAV, M4A) and size (under 100MB)' : 'Check image format (PNG, JPG, WebP) and size (under 5MB)'}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => setError('')}
                className="inline-flex rounded-md p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
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

            <div>
              <FileUpload
                type="audio"
                onUploadSuccess={handleAudioUpload}
                onUploadError={handleAudioUploadError}
                currentValue={formData.audio_url}
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
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          episode.published_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {episode.published_at ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          episode.audio_url 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {episode.audio_url ? 'Has Audio' : 'No Audio'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(episode.created_at)}
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