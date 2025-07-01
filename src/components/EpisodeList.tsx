import { useState, useMemo } from 'react';
import Image from 'next/image';
import { DataTable, Column } from '@/components/admin/DataTable';

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

  const handleDelete = (episode: Episode) => {
    if (confirm('Are you sure you want to delete this episode?')) {
      onDelete(episode.id);
    }
  };

  const episodeColumns: Column<Episode>[] = useMemo(() => [
    {
      key: 'image_url',
      header: 'Image',
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      sortable: false,
      searchable: false,
      render: (imageUrl, episode) => (
        <div className="w-12 h-12">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={episode.title}
              width={48}
              height={48}
              className="rounded-lg object-cover"
              onError={(e: any) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      header: 'Title',
      width: 300,
      minWidth: 200,
      sortable: true,
      render: (title, episode) => (
        <div>
          <div className="font-medium text-gray-900 truncate">{title}</div>
          {episode.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
              {episode.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'published_at',
      header: 'Status',
      width: 120,
      sortable: true,
      searchable: false,
      render: (publishedAt) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          publishedAt 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {publishedAt ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'audio_url',
      header: 'Audio',
      width: 100,
      sortable: false,
      searchable: false,
      render: (audioUrl) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          audioUrl 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {audioUrl ? 'Has Audio' : 'No Audio'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      width: 140,
      sortable: true,
      searchable: false,
      render: (value) => formatDate(value)
    },
    {
      key: 'published_at',
      header: 'Published',
      width: 140,
      sortable: true,
      searchable: false,
      render: (value) => formatDate(value)
    }
  ], []);

  return (
    <DataTable
      data={episodes}
      columns={episodeColumns}
      loading={isLoading}
      onEdit={onEdit}
      onDelete={handleDelete}
      emptyMessage="No episodes found. Create your first podcast episode to get started."
      searchPlaceholder="Search episodes..."
    />
  );
}