import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useFormManagement } from '@/hooks/useFormManagement';
import usePodcastManagement from '@/hooks/usePodcastManagement';
import { 
  EpisodeFormData, 
  podcastValidationSchema, 
  createInitialEpisodeData, 
  mapEpisodeToFormData,
  formatDate,
  formatDuration,
  generateSlug,
  parseDuration 
} from '@/utils/podcastValidation';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DurationInput } from '@/components/ui/DurationInput';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { AdminDataTable, TableColumn, TableAction, FileUploadField, Select, TextArea, Checkbox } from '@/components/admin/shared';

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
  episode_number?: number;
  season?: number;
  duration?: number;
  slug?: string;
  published?: boolean;
  featured?: boolean;
  full_audio_url?: string;
  quiz_id: string; // Required - enforces one-to-one relationship
  vsk_quizzes?: {
    id: string;
    title: string;
    total_questions: number;
  };
}

// Category Selector Component
interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategories, onCategoryChange }) => {
  const categories = [
    'General',
    'Clinical Practice', 
    'Surgery',
    'Internal Medicine',
    'Emergency Medicine',
    'Cardiology',
    'Dermatology',
    'Oncology',
    'Behavior',
    'Nutrition',
    'Preventive Medicine',
    'Radiology',
    'Laboratory Medicine',
    'Professional Development',
    'Practice Management',
    'Ethics',
    'Research'
  ];

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => handleCategoryToggle(category)}
          className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
            selectedCategories.includes(category)
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default function PodcastManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  
  const podcastManagement = usePodcastManagement();

  const {
    data: formData,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    reset,
    setData,
    setSubmitting,
  } = useFormManagement<EpisodeFormData>({
    initialData: createInitialEpisodeData(),
    validationSchema: podcastValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleCreateNew = () => {
    setEditingEpisode(null);
    const nextEpisodeNumber = podcastManagement.getNextEpisodeNumber();
    setData(createInitialEpisodeData(nextEpisodeNumber));
    setShowForm(true);
    podcastManagement.clearError();
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setData(mapEpisodeToFormData(episode));
    setShowForm(true);
    podcastManagement.clearError();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEpisode(null);
    reset();
    podcastManagement.clearError();
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    
    try {
      const slug = data.slug || generateSlug(data.title);
      const episodeData = {
        ...data,
        slug,
        episode_number: data.episode_number || 1,
        duration: data.duration === '' ? null : data.duration
      };

      if (editingEpisode) {
        await podcastManagement.updateEpisode(editingEpisode.id, episodeData);
      } else {
        await podcastManagement.createEpisode(episodeData);
      }

      setTimeout(() => {
        handleCancel();
      }, 2000);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  });

  const handleDeleteEpisode = async (episode: Episode) => {
    if (!confirm('Are you sure you want to delete this episode?')) {
      return;
    }
    await podcastManagement.deleteEpisode(episode.id);
  };

  const columns: TableColumn<Episode>[] = [
    {
      key: 'thumbnail_path',
      label: 'Image',
      render: (episode) => (
        <div className="w-12 h-12 relative">
          {episode.thumbnail_path ? (
            <Image
              src={episode.image_url || podcastManagement.getThumbnailUrl(episode.thumbnail_path) || ''}
              alt={episode.title}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'episode_number',
      label: 'Episode',
      render: (episode) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium">
            S{episode.season || 1}E{episode.episode_number || 1}
          </div>
          {episode.featured && (
            <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 mt-1">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (episode) => (
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
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (episode) => (
        <span className="text-sm text-gray-500">
          {episode.duration ? formatDuration(episode.duration) : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'quiz_id',
      label: 'Quiz',
      render: (episode) => (
        episode.vsk_quizzes ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            {episode.vsk_quizzes.title}
          </span>
        ) : (
          <span className="text-gray-400">No Quiz</span>
        )
      ),
    },
    {
      key: 'published',
      label: 'Status',
      render: (episode) => (
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
      ),
    },
    {
      key: 'published_at',
      label: 'Published',
      render: (episode) => (
        <span className="text-sm text-gray-500">
          {episode.published_at ? formatDate(episode.published_at) : 'Not published'}
        </span>
      ),
    },
    { key: 'actions', label: 'Actions' },
  ];

  const actions: TableAction<Episode>[] = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'ghost',
    },
    {
      label: 'Delete',
      onClick: handleDeleteEpisode,
      variant: 'ghost',
    },
  ];

  if (podcastManagement.loading) {
    return <LoadingState message="Loading podcast episodes..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Podcast Management</h2>
          <p className="text-gray-600 mt-1">Manage your podcast episodes</p>
        </div>
        <div className="flex space-x-3">
          {podcastManagement.error && typeof podcastManagement.error === 'string' && podcastManagement.error.includes('Failed to fetch episodes') && (
            <Button
              onClick={podcastManagement.handleMigration}
              disabled={podcastManagement.migrating}
              loading={podcastManagement.migrating}
              variant="accent"
            >
              {podcastManagement.migrating ? 'Migrating...' : 'Add Quiz Support'}
            </Button>
          )}
          {!showForm && (
            <Button onClick={handleCreateNew} variant="primary">
              Create New Episode
            </Button>
          )}
        </div>
      </div>

      {podcastManagement.error && (
        <ErrorDisplay
          error={typeof podcastManagement.error === 'string' ? podcastManagement.error : 'An error occurred'}
          onDismiss={podcastManagement.clearError}
        />
      )}

      {showForm ? (
        <Card title={editingEpisode ? 'Edit Episode' : 'Create New Episode'}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(value) => {
                handleChange('title', value);
                // Auto-generate slug from title if slug is empty or was auto-generated
                if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                  handleChange('slug', generateSlug(value));
                }
              }}
              required
              error={errors.title}
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              rows={3}
              error={errors.description}
            />

            {/* Categories section - temporarily disabled until database column is added
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <CategorySelector
                selectedCategories={formData.category}
                onCategoryChange={(categories) => handleChange('category', categories)}
              />
            </div>
            */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Season"
                type="number"
                value={formData.season.toString()}
                onChange={(value) => handleChange('season', parseInt(value) || 1)}
                min={1}
                error={errors.season}
              />
              
              <Input
                label="Episode Number"
                type="number"
                value={formData.episode_number.toString()}
                onChange={(value) => handleChange('episode_number', parseInt(value) || 1)}
                min={1}
                error={errors.episode_number}
              />

              <DurationInput
                label="Duration"
                value={formData.duration}
                onChange={(value) => handleChange('duration', value)}
                error={errors.duration}
              />
            </div>

            <Input
              label="URL Slug"
              value={formData.slug}
              onChange={(value) => handleChange('slug', value)}
              placeholder="Auto-generated from title"
              error={errors.slug}
            />

            <Checkbox
              label="Published"
              checked={formData.published}
              onChange={(checked) => handleChange('published', checked)}
            />

            <Select
              label="Associated Quiz"
              value={formData.quiz_id || ''}
              onChange={(value) => handleChange('quiz_id', value)}
              options={[
                { value: '', label: 'No Quiz' },
                ...podcastManagement.quizzes.map(quiz => ({ 
                  value: quiz.id, 
                  label: quiz.title 
                }))
              ]}
              placeholder="Select a quiz"
            />

            <FileUploadField
              label="Preview Audio"
              type="audio"
              value={formData.audio_url}
              onChange={(url, path) => handleChange('audio_url', url)}
              helpText="Short version for initial play"
            />

            <FileUploadField
              label="Full Audio"
              type="audio"
              value={formData.full_audio_url}
              onChange={(url, path) => handleChange('full_audio_url', url)}
              helpText="Complete episode for full access"
            />

            <FileUploadField
              label="Thumbnail Image"
              type="image"
              value={formData.image_url || (formData.thumbnail_path ? podcastManagement.getThumbnailUrl(formData.thumbnail_path) : '')}
              onChange={(url, path) => {
                handleChange('thumbnail_path', path);
                handleChange('image_url', url);
              }}
            />

            <Input
              label="Published Date"
              type="datetime-local"
              value={formData.published_at}
              onChange={(value) => handleChange('published_at', value)}
              required
              error={errors.published_at}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!isValid || podcastManagement.saving}
                loading={podcastManagement.saving}
                variant="primary"
              >
                {editingEpisode ? 'Update Episode' : 'Create Episode'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <AdminDataTable
          title={`${podcastManagement.episodes.length} ${podcastManagement.episodes.length === 1 ? 'episode' : 'episodes'}`}
          data={podcastManagement.episodes}
          columns={columns}
          actions={actions}
          loading={podcastManagement.loading}
          emptyMessage="No episodes found. Create your first podcast episode to get started."
          onRowClick={handleEdit}
        />
      )}
    </div>
  );
} 