import { useState, useEffect } from 'react';
import EpisodeForm from '@/components/EpisodeForm';
import EpisodeList from '@/components/EpisodeList';

interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string | null; // Database field (legacy, often null)
  thumbnail_path: string;   // Current field for thumbnails
  published_at: string;
  created_at: string;
  updated_at: string;
}

const PodcastManagement = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
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

  const handleSave = async (episodeData: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => {
    try {
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
        throw new Error('Failed to save episode');
      }

      await fetchEpisodes();
      setShowForm(false);
      setEditingEpisode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save episode');
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowForm(true);
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
  };

  const handleCreateNew = () => {
    setEditingEpisode(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Podcast Management</h2>
          <p className="text-neutral-600 mt-1">Manage your podcast episodes</p>
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
        <div className="bg-red-50 border border-gray-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            {editingEpisode ? 'Edit Episode' : 'Create New Episode'}
          </h3>
          <EpisodeForm
            episode={editingEpisode}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <EpisodeList
          episodes={episodes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PodcastManagement;