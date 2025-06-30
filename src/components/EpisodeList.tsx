import { useState } from 'react';
import Image from 'next/image';

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

interface EpisodeListProps {
  episodes: Episode[];
  onEdit: (episode: Episode) => void;
  onDelete: (episodeId: string) => void;
  isLoading?: boolean;
}

export default function EpisodeList({ episodes, onEdit, onDelete, isLoading = false }: EpisodeListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (episodeId: string) => {
    setDeleteConfirm(episodeId);
  };

  const handleDeleteConfirm = (episodeId: string) => {
    onDelete(episodeId);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Episodes Yet</h3>
        <p className="text-gray-600">Create your first podcast episode to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Episodes ({episodes.length})</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {episodes.map((episode) => (
          <div key={episode.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
              {episode.image_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={episode.image_url}
                    alt={episode.title}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                    onError={(e: any) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 truncate">
                  {episode.title}
                </h4>
                
                {episode.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {episode.description}
                  </p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Created: {formatDate(episode.created_at)}</span>
                  {episode.published_at ? (
                    <span>Published: {formatDate(episode.published_at)}</span>
                  ) : (
                    <span className="text-orange-600">Draft</span>
                  )}
                  {episode.audio_url && (
                    <span className="text-green-600">Has Audio</span>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onEdit(episode)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Edit
                </button>
                
                {deleteConfirm === episode.id ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDeleteConfirm(episode.id)}
                      className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleDeleteCancel}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteClick(episode.id)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}