import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useFormManagement } from '@/hooks/useFormManagement';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DurationInput } from '@/components/ui/DurationInput';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { AdminDataTable, TableColumn, TableAction, FileUploadField, TextArea, Checkbox } from '@/components/admin/shared';

interface ContentQuestion {
  id?: string;
  content_id: string;
  question_number: number;
  question_text: string;
  explanation?: string;
  rationale?: string;
  learning_outcome?: string;
  answers?: ContentAnswer[];
}

interface ContentAnswer {
  id?: string;
  question_id?: string;
  answer_letter: string;
  answer_text: string;
  is_correct: boolean;
}

interface Content {
  id: string;
  title: string;
  description: string;
  audio_src: string;
  full_audio_src: string;
  image_url: string | null;
  thumbnail_path: string;
  duration: number | null;
  episode_number: number;
  season: number;
  slug: string;
  published_at: string | null;
  is_published: boolean;
  featured: boolean;
  category: string | null;
  tags: string[] | null;
  show_notes: string | null;
  transcript: string | null;
  file_size: number | null;
  meta_title: string | null;
  meta_description: string | null;
  quiz_title: string | null;
  quiz_description: string | null;
  quiz_category: string | null;
  pass_percentage: number; // TODO: Remove pass_percentage functionality completely
  total_questions: number;
  quiz_is_active: boolean;
  // Payment fields
  price_cents: number | null;
  stripe_price_id: string | null;
  is_purchasable: boolean;
  // Special offer pricing fields
  special_offer_price_cents: number | null;
  special_offer_active: boolean;
  special_offer_start_date: string | null;
  special_offer_end_date: string | null;
  special_offer_description: string | null;
  created_at: string;
  updated_at: string;
  vsk_content_questions?: ContentQuestion[];
}

interface ContentFormData {
  title: string;
  description: string;
  audio_src: string;
  full_audio_src: string;
  image_url: string;
  thumbnail_path: string;
  duration: number;
  episode_number: number;
  season: number;
  slug: string;
  published_at: string;
  is_published: boolean;
  featured: boolean;
  category: string;
  show_notes: string;
  meta_title: string;
  meta_description: string;
  quiz_title: string;
  quiz_description: string;
  quiz_category: string;
  pass_percentage: number; // TODO: Remove pass_percentage functionality completely
  quiz_is_active: boolean;
  series_id: string;
  // Payment fields
  price_cents: number;
  is_purchasable: boolean;
  // Special offer pricing fields
  special_offer_price_cents: number;
  special_offer_active: boolean;
  special_offer_start_date: string;
  special_offer_end_date: string;
  special_offer_description: string;
  questions: ContentQuestion[];
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}:00`;
};

const getDefaultThumbnailUrl = (): string => {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl('thumbnails/1753642620645-zoonoses-s1e2.png');
  return data.publicUrl;
};

const getThumbnailUrl = (content: Content): string => {
  // If there's a direct image_url (external URL), use it
  if (content.image_url && content.image_url.trim() !== '') {
    return content.image_url;
  }
  
  // If there's a thumbnail_path (Supabase storage), get the public URL
  if (content.thumbnail_path && content.thumbnail_path.trim() !== '') {
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(content.thumbnail_path);
      return data.publicUrl || getDefaultThumbnailUrl();
    } catch (error) {
      console.warn('Error getting thumbnail URL:', error);
      return getDefaultThumbnailUrl();
    }
  }
  
  // Default fallback image
  return getDefaultThumbnailUrl();
};

const getFormThumbnailUrl = (formData: ContentFormData): string => {
  // If there's a direct image_url (external URL), use it
  if (formData.image_url && formData.image_url.trim() !== '') {
    return formData.image_url;
  }
  
  // If there's a thumbnail_path (Supabase storage), get the public URL
  if (formData.thumbnail_path && formData.thumbnail_path.trim() !== '') {
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(formData.thumbnail_path);
      return data.publicUrl || getDefaultThumbnailUrl();
    } catch (error) {
      console.warn('Error getting form thumbnail URL:', error);
      return getDefaultThumbnailUrl();
    }
  }
  
  return getDefaultThumbnailUrl();
};

const ensureQuestionDefaults = (question: ContentQuestion, questionNumber: number): ContentQuestion => ({
  ...question,
  question_text: question.question_text || `Which of the following best describes the key concept covered in question ${questionNumber}?`,
  explanation: question.explanation || 'This question assesses understanding of fundamental veterinary nursing principles.',
  rationale: question.rationale || 'Understanding this concept is essential for safe and effective veterinary nursing practice. The correct answer demonstrates knowledge of evidence-based protocols and clinical reasoning.',
  learning_outcome: question.learning_outcome || 'Analyze and apply key veterinary nursing concepts in clinical practice scenarios',
  answers: question.answers?.map((answer, index) => ({
    ...answer,
    answer_text: answer.answer_text || (index === 0 ? 'First answer option - replace with correct content' : `${['Second', 'Third', 'Fourth'][index - 1]} answer option - replace with incorrect content`)
  })) || [
    { answer_letter: 'A', answer_text: 'First answer option - replace with correct content', is_correct: true },
    { answer_letter: 'B', answer_text: 'Second answer option - replace with incorrect content', is_correct: false },
    { answer_letter: 'C', answer_text: 'Third answer option - replace with incorrect content', is_correct: false },
    { answer_letter: 'D', answer_text: 'Fourth answer option - replace with incorrect content', is_correct: false }
  ]
});

const createInitialFormData = (episodeNumber: number = 1): ContentFormData => ({
  title: `Episode ${episodeNumber} - New Content`,
  description: 'A comprehensive educational episode covering important veterinary nursing concepts and best practices.',
  audio_src: '',
  full_audio_src: '',
  image_url: '',
  thumbnail_path: '',
  duration: 3600,
  episode_number: episodeNumber,
  season: 1,
  slug: `episode-${episodeNumber}-new-content`,
  published_at: new Date().toISOString().slice(0, 16),
  is_published: false,
  featured: false,
  category: '',
  show_notes: 'In this episode, we explore key concepts and practical applications relevant to modern veterinary nursing practice.',
  meta_title: `Episode ${episodeNumber} - VetSidekick CPD`,
  meta_description: 'Professional development content for veterinary nurses focusing on clinical skills and knowledge enhancement.',
  quiz_title: `Episode ${episodeNumber} Assessment`,
  quiz_description: 'Test your understanding of the key concepts covered in this episode.',
  quiz_category: 'general',
  pass_percentage: 70, // TODO: Remove pass_percentage functionality completely
  quiz_is_active: true,
  series_id: '',
  // Payment fields
  price_cents: 999, // Default £9.99
  is_purchasable: true,
  // Special offer pricing fields
  special_offer_price_cents: 0,
  special_offer_active: false,
  special_offer_start_date: '',
  special_offer_end_date: '',
  special_offer_description: '',
  questions: []
});

export default function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [activeTab, setActiveTab] = useState<'podcast' | 'quiz'>('podcast');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableSeries, setAvailableSeries] = useState<{id: string; name: string}[]>([]);

  const {
    data: formData,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    reset,
    setData,
  } = useFormManagement<ContentFormData>({
    initialData: createInitialFormData(),
    validationSchema: {
      title: { required: true, minLength: 1 },
      episode_number: { required: true, min: 1 },
      season: { required: true, min: 1 },
      published_at: { required: true },
      quiz_title: { required: false },
      pass_percentage: { required: true, min: 0, max: 100 } // TODO: Remove pass_percentage functionality completely
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  useEffect(() => {
    fetchContent();
    fetchKeywords();
    fetchSeries();
  }, []);

  // Clean up selected categories when available keywords change
  useEffect(() => {
    if (availableKeywords.length > 0) {
      setSelectedCategories(prev => prev.filter(cat => availableKeywords.includes(cat)));
    }
  }, [availableKeywords]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/keywords');
      if (response.ok) {
        const data = await response.json();
        const keywords = data.keywords || [];
        
        // If no keywords in database, use some defaults
        if (keywords.length === 0) {
          setAvailableKeywords([
            'Clinical Practice',
            'Professional Development',
            'Surgery',
            'Emergency Care',
            'Anesthesia',
            'Pharmacology',
            'Nursing Skills',
            'Ethics',
            'Pain Management',
            'Infection Control',
            'Diagnostic Imaging',
            'Laboratory Medicine'
          ]);
        } else {
          setAvailableKeywords(keywords);
        }
      }
    } catch (err) {
      console.error('Failed to fetch keywords:', err);
      // Fallback keywords if API fails
      setAvailableKeywords([
        'Clinical Practice',
        'Professional Development',
        'Surgery',
        'Emergency Care',
        'Ethics'
      ]);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/admin/series');
      if (response.ok) {
        const data = await response.json();
        setAvailableSeries(data.map((series: any) => ({
          id: series.id,
          name: series.name
        })));
      }
    } catch (err) {
      console.error('Failed to fetch series:', err);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      console.log('ContentManagement: Starting fetch from /api/admin/content');
      const response = await fetch('/api/admin/content');
      console.log('ContentManagement: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('ContentManagement: Error response data:', errorData);
        
        if (response.status === 500) {
          // Check if it's a table not found error
          if (errorData.details?.includes('vsk_content') || errorData.details?.includes('relationship')) {
            console.log('ContentManagement: Setting MIGRATION_NEEDED error');
            setError('MIGRATION_NEEDED');
            setLoading(false);
            return;
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('ContentManagement: Successfully fetched data:', data?.length || 0, 'items');
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('ContentManagement: Fetch error:', err);
      setError(`Failed to fetch content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const getNextEpisodeNumber = (): number => {
    if (content.length === 0) return 1;
    return Math.max(...content.map(c => c.episode_number)) + 1;
  };

  const handleCreateNew = () => {
    setEditingContent(null);
    const nextEpisodeNumber = getNextEpisodeNumber();
    setData(createInitialFormData(nextEpisodeNumber));
    setShowForm(true);
    setActiveTab('podcast');
    setSelectedQuestionIndex(0);
    setError(null);
  };

  const handleEdit = async (contentItem: Content) => {
    setEditingContent(contentItem);
    setLoading(true);
    
    try {
      // Fetch the complete content item with questions
      const response = await fetch(`/api/admin/content?id=${contentItem.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content details');
      }
      const fullContentItem = await response.json();
      
      setData({
        title: fullContentItem.title || `Episode ${fullContentItem.episode_number} - New Content`,
        description: fullContentItem.description || 'A comprehensive educational episode covering important veterinary nursing concepts and best practices.',
        audio_src: fullContentItem.audio_src || '',
        full_audio_src: fullContentItem.full_audio_src || '',
        image_url: fullContentItem.image_url || '',
        thumbnail_path: fullContentItem.thumbnail_path || '',
        duration: fullContentItem.duration || 3600,
        episode_number: fullContentItem.episode_number,
        season: fullContentItem.season,
        slug: fullContentItem.slug || `episode-${fullContentItem.episode_number}-new-content`,
        published_at: fullContentItem.published_at ? new Date(fullContentItem.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        is_published: fullContentItem.is_published,
        featured: fullContentItem.featured || false,
        category: fullContentItem.category || '',
        show_notes: fullContentItem.show_notes || 'In this episode, we explore key concepts and practical applications relevant to modern veterinary nursing practice.',
        meta_title: fullContentItem.meta_title || `Episode ${fullContentItem.episode_number} - VetSidekick CPD`,
        meta_description: fullContentItem.meta_description || 'Professional development content for veterinary nurses focusing on clinical skills and knowledge enhancement.',
        quiz_title: fullContentItem.quiz_title || `Episode ${fullContentItem.episode_number} Assessment`,
        quiz_description: fullContentItem.quiz_description || 'Test your understanding of the key concepts covered in this episode.',
        quiz_category: fullContentItem.quiz_category || 'general',
        pass_percentage: fullContentItem.pass_percentage, // TODO: Remove pass_percentage functionality completely
        quiz_is_active: fullContentItem.quiz_is_active,
        series_id: fullContentItem.series_id || '',
        // Payment fields
        price_cents: fullContentItem.price_cents || 999,
        is_purchasable: fullContentItem.is_purchasable !== false,
        // Special offer pricing fields
        special_offer_price_cents: fullContentItem.special_offer_price_cents || 0,
        special_offer_active: fullContentItem.special_offer_active || false,
        special_offer_start_date: fullContentItem.special_offer_start_date ? fullContentItem.special_offer_start_date.slice(0, 16) : '',
        special_offer_end_date: fullContentItem.special_offer_end_date ? fullContentItem.special_offer_end_date.slice(0, 16) : '',
        special_offer_description: fullContentItem.special_offer_description || '',
        questions: (fullContentItem.vsk_content_questions || []).map((q, index) => ensureQuestionDefaults(q, index + 1))
      });
      
      // Only set categories that exist in our available keywords
      const existingCategories = fullContentItem.category ? fullContentItem.category.split(',').map(c => c.trim()) : [];
      setSelectedCategories(existingCategories.filter(cat => availableKeywords.includes(cat)));
      
    } catch (err) {
      setError(`Failed to load content details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
    
    setShowForm(true);
    setActiveTab('podcast');
    setSelectedQuestionIndex(0);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContent(null);
    setSelectedCategories([]);
    reset();
    setError(null);
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    setSaving(true);
    try {
      const slug = data.slug || generateSlug(data.title);
      const contentData = {
        ...data,
        slug,
        duration: data.duration || null,
        quiz_title: data.quiz_title || data.title + ' Quiz',
        category: selectedCategories.filter(cat => availableKeywords.includes(cat)).join(', '),
        series_id: data.series_id || null,
        questions: data.questions
      };

      console.log('Submitting content data:', {
        ...contentData,
        questions: `${contentData.questions?.length || 0} questions`
      });

      const response = await fetch('/api/admin/content' + (editingContent ? `?id=${editingContent.id}` : ''), {
        method: editingContent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save content`);
      }

      await fetchContent();
      setTimeout(() => {
        handleCancel();
      }, 1000);
    } catch (err) {
      setError(`Failed to save content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  });

  const handleDeleteContent = async (contentItem: Content) => {
    const reason = prompt(
      `Are you sure you want to delete "${contentItem.title}"?\n\n` +
      'This will hide the content from users but preserve all user progress data.\n' +
      'Optional: Enter a reason for deletion:'
    );
    
    if (reason === null) {
      return; // User cancelled
    }

    try {
      const response = await fetch(`/api/admin/content?id=${contentItem.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content');
      }

      const result = await response.json();
      console.log('Delete result:', result.message);
      await fetchContent();
    } catch (err) {
      setError(`Failed to delete content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddQuestion = () => {
    const questionNumber = formData.questions.length + 1;
    const newQuestion: ContentQuestion = {
      content_id: editingContent?.id || 'new',
      question_number: questionNumber,
      question_text: `Which of the following best describes the key concept covered in question ${questionNumber}?`,
      explanation: 'This question assesses understanding of fundamental veterinary nursing principles.',
      rationale: 'Understanding this concept is essential for safe and effective veterinary nursing practice. The correct answer demonstrates knowledge of evidence-based protocols and clinical reasoning.',
      learning_outcome: `Analyze and apply key veterinary nursing concepts in clinical practice scenarios`,
      answers: [
        { answer_letter: 'A', answer_text: 'First answer option - replace with correct content', is_correct: true },
        { answer_letter: 'B', answer_text: 'Second answer option - replace with incorrect content', is_correct: false },
        { answer_letter: 'C', answer_text: 'Third answer option - replace with incorrect content', is_correct: false },
        { answer_letter: 'D', answer_text: 'Fourth answer option - replace with incorrect content', is_correct: false }
      ]
    };
    
    const newQuestions = [...formData.questions, newQuestion];
    handleChange('questions', newQuestions);
    setSelectedQuestionIndex(newQuestions.length - 1);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    // Renumber questions
    newQuestions.forEach((q, i) => q.question_number = i + 1);
    handleChange('questions', newQuestions);
    
    if (selectedQuestionIndex >= newQuestions.length) {
      setSelectedQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange('questions', newQuestions);
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    const newAnswers = [...(newQuestions[questionIndex].answers || [])];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], [field]: value };
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], answers: newAnswers };
    handleChange('questions', newQuestions);
  };

  const handleCategoryToggle = (keyword: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(cat => cat !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const columns: TableColumn<Content>[] = [
    {
      key: 'thumbnail_path',
      label: 'Image',
      render: (content) => (
        <div className="w-12 h-12 relative">
          <Image
            src={getThumbnailUrl(content)}
            alt={content.title}
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />
        </div>
      ),
    },
    {
      key: 'episode_number',
      label: 'Episode',
      sortable: true,
      render: (content) => (
        <div className="text-sm">
          <div className="text-emerald-900 font-medium">
            S{content.season}E{content.episode_number}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {content.featured && (
              <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800">
                Featured
              </span>
            )}
            {content.is_published && (
              <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                Published
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (content) => (
        <div className="max-w-xs">
          <div className="font-medium text-emerald-900 truncate" title={content.title}>
            {content.title}
          </div>
          {content.description && (
            <div className="text-sm text-emerald-500 mt-1 line-clamp-2" title={content.description}>
              {content.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (content) => (
        <span className="text-sm text-emerald-500">
          {content.duration ? formatDuration(content.duration) : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'total_questions',
      label: 'Quiz',
      sortable: true,
      render: (content) => (
        <div className="text-sm">
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            {content.total_questions} questions
          </span>
          {content.quiz_title && (
            <div className="text-emerald-500 mt-1 text-xs truncate">
              {content.quiz_title}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      sortable: true,
      render: (content) => (
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
            content.is_published 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {content.is_published ? 'Published' : 'Draft'}
          </span>
          {content.audio_src && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 w-fit">
              Audio
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'price_cents',
      label: 'Pricing',
      sortable: true,
      render: (content) => (
        <div className="text-sm">
          <div className="font-medium text-emerald-900">
            £{((content.price_cents || 0) / 100).toFixed(2)}
          </div>
          {content.special_offer_active && content.special_offer_price_cents && (
            <div className="text-xs text-green-600 font-medium">
              Special: £{(content.special_offer_price_cents / 100).toFixed(2)}
            </div>
          )}
          <div className="text-xs text-emerald-500">
            {content.is_purchasable ? 'Purchasable' : 'Free'}
          </div>
        </div>
      ),
    },
    {
      key: 'published_at',
      label: 'Published',
      sortable: true,
      render: (content) => (
        <span className="text-sm text-emerald-500">
          {content.published_at ? formatDate(content.published_at) : 'Not published'}
        </span>
      ),
    },
    { key: 'actions', label: 'Actions' },
  ];

  const actions: TableAction<Content>[] = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'ghost',
    },
    {
      label: 'Delete',
      onClick: handleDeleteContent,
      variant: 'ghost',
    },
  ];

  if (loading) {
    return <LoadingState message="Loading content..." />;
  }

  // Special case: Migration needed - TEMPORARILY DISABLED FOR DEBUGGING
  if (error === 'MIGRATION_NEEDED_DISABLED') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">Content Management</h2>
            <p className="text-emerald-700 mt-1">Unified podcast episodes and quiz management</p>
          </div>
          <button
            onClick={() => {
              console.log('Manual refresh triggered');
              setError(null);
              fetchContent();
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry Fetch
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Debug Info</h3>
          <p className="text-yellow-700 text-sm">Migration error detected. Current error: {error}</p>
          <p className="text-yellow-700 text-sm">Content count: {content.length}</p>
        </div>

        {/* Setup Required Message */}
        {/* hasSetup and runMigration are not defined in the original file, so this block is commented out */}
        {/* {!hasSetup && (
          <div className="mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-emerald-900">Setup Required</h3>
              <p className="text-emerald-700">The unified content management system needs to be set up.</p>
              
              <div className="mt-4 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-900 mb-2">Quick Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-emerald-800">
                    <li>Run the SQL migration script below</li>
                    <li>Restart your application</li>
                    <li>Create your first content item</li>
                  </ol>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-emerald-900">SQL Migration Script:</h4>
                    <Button
                      onClick={runMigration}
                      variant="secondary"
                      size="sm"
                      disabled={migrationRunning}
                    >
                      {migrationRunning ? 'Running...' : 'Run Migration'}
                    </Button>
                  </div>
                  <pre className="text-xs text-emerald-700 bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {migrationScript}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Content Form */}
        {showForm && (
          <div className="bg-white border border-emerald-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-emerald-900">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h3>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingContent(null);
                  reset();
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b border-emerald-200 mb-6">
                <h4 className="text-lg font-medium text-emerald-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700">
                      Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(value) => handleChange('title', value)}
                      placeholder="Enter content title"
                      error={errors.title}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700">
                      Description
                    </label>
                    <TextArea
                      value={formData.description}
                      onChange={(value) => handleChange('description', value)}
                      rows={3}
                      placeholder="Enter content description"
                      error={errors.description}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Purchase */}
              <div>
                <h4 className="text-md font-medium text-emerald-900 mb-4">Pricing & Purchase</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price (£)"
                    type="number"
                    step={0.01}
                    min={0}
                    value={formData.price_cents === 0 ? '' : (formData.price_cents / 100).toString()}
                    onChange={(value) => {
                      if (value === '' || value === null || value === undefined) {
                        handleChange('price_cents', 0);
                        return;
                      }
                      const numValue = parseFloat(value);
                      if (isNaN(numValue)) {
                        return;
                      }
                      const centsValue = Math.round(numValue * 100);
                      handleChange('price_cents', centsValue);
                    }}
                    placeholder="9.99"
                    error={errors.price_cents}
                  />
                  
                  <Checkbox
                    label="Available for Purchase"
                    checked={formData.is_purchasable}
                    onChange={(checked) => handleChange('is_purchasable', checked)}
                  />
                </div>
                
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <h5 className="text-sm font-medium text-emerald-900 mb-3">Special Offer Settings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Special Offer Price (£)"
                      type="number"
                      step={0.01}
                      min={0}
                      value={formData.special_offer_price_cents === 0 ? '' : (formData.special_offer_price_cents / 100).toString()}
                      onChange={(value) => {
                        if (value === '' || value === null || value === undefined) {
                          handleChange('special_offer_price_cents', 0);
                          return;
                        }
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                          return;
                        }
                        const centsValue = Math.round(numValue * 100);
                        handleChange('special_offer_price_cents', centsValue);
                      }}
                      placeholder="7.99"
                    />
                    
                    <Checkbox
                      label="Special Offer Active"
                      checked={formData.special_offer_active}
                      onChange={(checked) => handleChange('special_offer_active', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Quiz Settings */}
              <div>
                <h4 className="text-md font-medium text-emerald-900 mb-4">Quiz Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quiz Title"
                    value={formData.quiz_title}
                    onChange={(value) => handleChange('quiz_title', value)}
                    placeholder="Auto-generated from episode title"
                    error={errors.quiz_title}
                  />
                  
                  <Input
                    label="Quiz Category"
                    value={formData.quiz_category}
                    onChange={(value) => handleChange('quiz_category', value)}
                    placeholder="Enter quiz category"
                    error={errors.quiz_category}
                  />
                </div>
              </div>

              {/* Quiz Questions */}
              <div>
                <h3 className="text-lg font-medium text-emerald-900">Quiz Questions</h3>
                <div className="space-y-6">
                  {formData.questions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Question List */}
                      <div className="lg:col-span-1">
                        <h4 className="text-sm font-medium text-emerald-700 mb-3">Questions</h4>
                        <div className="space-y-2">
                          {formData.questions.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedQuestionIndex(index)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg border ${
                                selectedQuestionIndex === index
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              Question {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Question Editor */}
                      <div className="lg:col-span-3">
                        {formData.questions[selectedQuestionIndex] && (
                          <div className="bg-white border border-emerald-200 rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-medium text-emerald-900">
                                Question {selectedQuestionIndex + 1}
                              </h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveQuestion(selectedQuestionIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <TextArea
                                label="Question Text"
                                value={formData.questions[selectedQuestionIndex].question_text}
                                onChange={(value) => handleQuestionChange(selectedQuestionIndex, 'question_text', value)}
                                rows={3}
                                placeholder="Enter your question here..."
                                error={errors.questions?.[selectedQuestionIndex] as string}
                              />

                              <TextArea
                                label="Learning Outcome"
                                value={formData.questions[selectedQuestionIndex].learning_outcome || 'Analyze and apply key veterinary nursing concepts in clinical practice scenarios'}
                                onChange={(value) => handleQuestionChange(selectedQuestionIndex, 'learning_outcome', value)}
                                rows={2}
                                placeholder="What should students learn from this question?"
                                error={errors.questions?.[selectedQuestionIndex] as string}
                              />

                              <TextArea
                                label="Rationale"
                                value={formData.questions[selectedQuestionIndex].rationale || 'Understanding this concept is essential for safe and effective veterinary nursing practice. The correct answer demonstrates knowledge of evidence-based protocols and clinical reasoning.'}
                                onChange={(value) => handleQuestionChange(selectedQuestionIndex, 'rationale', value)}
                                rows={3}
                                placeholder="Explain why the correct answer is correct..."
                                error={errors.questions?.[selectedQuestionIndex] as string}
                              />

                              <div>
                                <label className="block text-sm font-medium text-emerald-700 mb-3">Answer Options</label>
                                <div className="space-y-3">
                                  {formData.questions[selectedQuestionIndex].answers?.map((answer, answerIndex) => (
                                    <div key={answerIndex} className="flex items-center gap-3">
                                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-600">
                                        {answer.answer_letter}
                                      </span>
                                      <Input
                                        value={answer.answer_text}
                                        onChange={(value) => handleAnswerChange(selectedQuestionIndex, answerIndex, 'answer_text', value)}
                                        placeholder={`Answer ${answer.answer_letter}`}
                                        className="flex-1"
                                        error={errors.questions?.[selectedQuestionIndex] as string}
                                      />
                                      <label className="flex items-center text-sm">
                                        <input
                                          type="checkbox"
                                          checked={answer.is_correct}
                                          onChange={(e) => handleAnswerChange(selectedQuestionIndex, answerIndex, 'is_correct', e.target.checked)}
                                          className="mr-2 text-emerald-600 focus:ring-teal-500"
                                        />
                                        Correct
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-emerald-600">
                      <p>No questions yet. Click "Add Question" to get started.</p>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    variant="secondary"
                    className="w-full"
                  >
                    Add Question
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={!isValid || saving}
                  loading={saving}
                  variant="primary"
                >
                  {editingContent ? 'Update Content' : 'Create Content'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Content List */}
        <div className="bg-white border border-emerald-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-900">
              Content ({content.length})
            </h3>
          </div>

          {(() => {
            console.log('ContentManagement: Render decision - loading:', loading, 'content.length:', content.length, 'content:', content);
            
            if (loading) {
              console.log('ContentManagement: Rendering loading state');
              return (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-emerald-600 mt-2">Loading content...</p>
                </div>
              );
            } else if (content.length === 0) {
              console.log('ContentManagement: Rendering empty state');
              return (
                <div className="text-center py-12 text-emerald-600">
                  <p>No content found. Create your first podcast episode with quiz to get started.</p>
                </div>
              );
            } else {
              console.log('ContentManagement: Rendering data table with', content.length, 'items');
              return (
                <AdminDataTable
                  title={`${content.length} ${content.length === 1 ? 'content item' : 'content items'}`}
                  data={content}
                  columns={columns}
                  actions={actions}
                  loading={loading}
                  emptyMessage="No content found. Create your first podcast episode with quiz to get started."
                  onRowClick={handleEdit}
                />
              );
            }
          })()}
        </div>
      </div>
    );
  }
}