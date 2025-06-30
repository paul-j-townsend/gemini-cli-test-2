import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import EpisodeForm from '@/components/EpisodeForm';
import EpisodeList from '@/components/EpisodeList';

interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

type EpisodeFormData = Omit<Episode, 'id' | 'created_at' | 'updated_at'>;

export default function PodcastAdmin() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Error fetching episodes:', err);
      setError('Failed to load episodes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingEpisode(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowForm(true);
    setError(null);
  };

  const handleSave = async (formData: EpisodeFormData) => {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save episode');
      }

      const data = await response.json();
      
      if (editingEpisode) {
        // Update existing episode
        setEpisodes(prev => prev.map(ep => 
          ep.id === editingEpisode.id ? data.episode : ep
        ));
      } else {
        // Add new episode
        setEpisodes(prev => [data.episode, ...prev]);
      }

      setShowForm(false);
      setEditingEpisode(null);
    } catch (err) {
      console.error('Error saving episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to save episode');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (episodeId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/podcast-admin/episodes/${episodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete episode');
      }

      setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
    } catch (err) {
      console.error('Error deleting episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete episode');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEpisode(null);
    setError(null);
  };

  return (
    <Layout>
      <Head>
        <title>Podcast Admin - Vet Sidekick</title>
        <meta name="description" content="Manage podcast episodes" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Podcast Admin</h1>
            <p className="mt-2 text-gray-600">
              Manage your podcast episodes - create, edit, and organize your content.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 p-1.5 hover:bg-red-100 rounded-md"
                >
                  <span className="sr-only">Dismiss</span>
                  ×
                </button>
              </div>
            </div>
          )}

          {!showForm && (
            <div className="mb-6">
              <button
                onClick={handleCreateNew}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create New Episode
              </button>
            </div>
          )}

          <div className="space-y-6">
            {showForm && (
              <EpisodeForm
                episode={editingEpisode || undefined}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={saving}
              />
            )}

            <EpisodeList
              episodes={episodes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}