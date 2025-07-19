import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { AdminDataTable, TableColumn, TableAction, FileUploadField, TextArea } from '@/components/admin/shared';
import { Series } from '@/types/database';

interface SeriesFormData {
  name: string;
  slug: string;
  description: string;
  thumbnail_path: string;
  display_order: number;
  is_active: boolean;
}

const SeriesManagement: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);

  const [formData, setFormData] = useState<SeriesFormData>({
    name: '',
    slug: '',
    description: '',
    thumbnail_path: '',
    display_order: 0,
    is_active: true,
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/series?with_content_count=true');

      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }

      const data = await response.json();
      setSeries(data);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleCreateSeries = () => {
    setEditingSeries(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      thumbnail_path: '',
      display_order: series.length + 1,
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const handleEditSeries = (seriesItem: Series) => {
    setEditingSeries(seriesItem);
    setFormData({
      name: seriesItem.name,
      slug: seriesItem.slug,
      description: seriesItem.description || '',
      thumbnail_path: seriesItem.thumbnail_path || '',
      display_order: seriesItem.display_order,
      is_active: seriesItem.is_active,
    });
    setIsFormOpen(true);
  };

  const handleDeleteSeries = async (seriesItem: Series) => {
    if (!confirm(`Are you sure you want to delete "${seriesItem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/series/${seriesItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete series');
      }

      await fetchSeries();
    } catch (err) {
      console.error('Error deleting series:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete series');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSeries 
        ? `/api/admin/series/${editingSeries.id}` 
        : '/api/admin/series';
      
      const method = editingSeries ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save series');
      }

      setIsFormOpen(false);
      await fetchSeries();
    } catch (err) {
      console.error('Error saving series:', err);
      alert(err instanceof Error ? err.message : 'Failed to save series');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(series);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSeries(items);

    const seriesUpdates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    try {
      const response = await fetch('/api/admin/series/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ series_updates: seriesUpdates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update series order');
      }
    } catch (err) {
      console.error('Error updating series order:', err);
      alert('Failed to update series order');
      await fetchSeries(); // Refresh to revert changes
    }
  };

  const columns: TableColumn<Series>[] = [
    {
      key: 'thumbnail_path',
      label: 'Thumbnail',
      render: (series) => (
        <div className="w-12 h-12 relative">
          {series.thumbnail_path ? (
            <Image
              src={series.thumbnail_path}
              alt={series.name}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (series) => (
        <div>
          <div className="font-medium">{series.name}</div>
          <div className="text-sm text-gray-500">{series.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (series) => (
        <div className="max-w-xs truncate">
          {series.description || 'No description'}
        </div>
      ),
    },
    {
      key: 'display_order',
      label: 'Order',
      render: (series) => series.display_order,
    },
    {
      key: 'actions' as keyof Series,
      label: 'Content',
      render: (series) => (series as any).content_count || 0,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (series) => (
        <span className={`px-2 py-1 rounded text-xs ${
          series.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {series.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const actions: TableAction<Series>[] = [
    {
      label: 'Edit',
      onClick: handleEditSeries,
    },
    {
      label: 'Delete',
      onClick: handleDeleteSeries,
      variant: 'ghost',
    },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Series Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDragMode(!isDragMode)}
            variant={isDragMode ? 'primary' : 'secondary'}
          >
            {isDragMode ? 'Exit Reorder Mode' : 'Reorder Series'}
          </Button>
          <Button onClick={handleCreateSeries}>
            Create Series
          </Button>
        </div>
      </div>

      {isDragMode ? (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Drag to Reorder Series</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="series">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {series.map((seriesItem, index) => (
                    <Draggable key={seriesItem.id} draggableId={seriesItem.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 mb-2 bg-white border rounded shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-500">
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 relative">
                              {seriesItem.thumbnail_path ? (
                                <Image
                                  src={seriesItem.thumbnail_path}
                                  alt={seriesItem.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{seriesItem.name}</div>
                              <div className="text-sm text-gray-500">{seriesItem.slug}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      ) : (
        <AdminDataTable
          data={series}
          columns={columns}
          actions={actions}
        />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 m-4">
            <h3 className="text-lg font-medium mb-4">
              {editingSeries ? 'Edit Series' : 'Create Series'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(name: string) => {
                      setFormData(prev => ({
                        ...prev,
                        name,
                        slug: generateSlug(name)
                      }));
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(slug: string) => setFormData(prev => ({
                      ...prev,
                      slug
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <TextArea
                  value={formData.description}
                  onChange={(description: string) => setFormData(prev => ({
                    ...prev,
                    description
                  }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <FileUploadField
                  label="Thumbnail"
                  type="image"
                  value={formData.thumbnail_path}
                  onChange={(url) => setFormData(prev => ({
                    ...prev,
                    thumbnail_path: url
                  }))}
                  helpText="Upload series thumbnail"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={formData.display_order.toString()}
                    onChange={(value: string) => setFormData(prev => ({
                      ...prev,
                      display_order: parseInt(value) || 0
                    }))}
                    min={1}
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                        ...prev,
                        is_active: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSeries ? 'Update' : 'Create'} Series
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SeriesManagement;