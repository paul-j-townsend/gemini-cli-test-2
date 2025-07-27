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
      const response = await fetch('/api/admin/content');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 500) {
          // Check if it's a table not found error
          if (errorData.details?.includes('vsk_content') || errorData.details?.includes('relationship')) {
            setError('MIGRATION_NEEDED');
            setLoading(false);
            return;
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setContent(data);
      setError(null);
    } catch (err) {
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
    if (!confirm('Are you sure you want to delete this content? This will also delete all associated quiz questions.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content?id=${contentItem.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content');
      }

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
          <div className="text-gray-900 font-medium">
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
          <div className="font-medium text-gray-900 truncate" title={content.title}>
            {content.title}
          </div>
          {content.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-2" title={content.description}>
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
        <span className="text-sm text-gray-500">
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
            <div className="text-gray-500 mt-1 text-xs truncate">
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
      sortable: true,
      render: (content) => (
        <span className="text-sm text-gray-500">
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

  // Special case: Migration needed
  if (error === 'MIGRATION_NEEDED') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <p className="text-gray-600 mt-1">Unified podcast episodes and quiz management</p>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Setup Required</h3>
                <p className="text-gray-600">The unified content management system needs to be set up.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Quick Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Go to your <strong>Supabase Dashboard</strong></li>
                <li>Open the <strong>SQL Editor</strong></li>
                <li>Copy and paste the SQL below</li>
                <li>Click <strong>Run</strong> to create the unified content tables</li>
                <li>Refresh this page to start using the unified interface</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">SQL Migration Script:</h4>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Step 1: Create unified content table
CREATE TABLE vsk_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_src TEXT,
    full_audio_src TEXT,
    image_url TEXT,
    thumbnail_path TEXT,
    duration INTEGER,
    episode_number INTEGER NOT NULL DEFAULT 1,
    season INTEGER NOT NULL DEFAULT 1,
    slug TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    category TEXT,
    tags TEXT[],
    show_notes TEXT,
    transcript TEXT,
    file_size INTEGER,
    meta_title TEXT,
    meta_description TEXT,
    quiz_title TEXT,
    quiz_description TEXT,
    quiz_category TEXT,
    pass_percentage INTEGER DEFAULT 70,
    total_questions INTEGER DEFAULT 0,
    quiz_is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create questions table
CREATE TABLE vsk_content_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    rationale TEXT,
    learning_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, question_number)
);

-- Step 3: Create answers table
CREATE TABLE vsk_content_question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, answer_letter)
);

-- Step 4: Enable RLS
ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to content" ON vsk_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content" ON vsk_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to content questions" ON vsk_content_questions FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content questions" ON vsk_content_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to content question answers" ON vsk_content_question_answers FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content question answers" ON vsk_content_question_answers FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Insert sample data
INSERT INTO vsk_content (
    id, title, description, audio_src, full_audio_src, episode_number, season, slug, 
    is_published, featured, category, published_at,
    quiz_title, quiz_description, quiz_category, pass_percentage, total_questions, quiz_is_active
) VALUES (
    '10000000-0000-0000-0000-000000000001', 
    'Ethics in Veterinary Practice', 
    'An introduction to ethical considerations in veterinary nursing', 
    '/audio/ethics-preview.mp3', 
    '/audio/ethics-full.mp3', 
    1, 1, 
    'ethics-in-veterinary-practice', 
    true, true, 
    'Professional Development', 
    NOW(),
    'Veterinary Ethics Assessment',
    'Test your understanding of ethical principles',
    'ethics',
    70, 2, true
);

-- Step 6: Insert sample questions
INSERT INTO vsk_content_questions (content_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    1,
    'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
    'This question tests understanding of the four core principles of biomedical ethics.',
    'Beneficence requires acting in the best interests of the patient, including optimal nursing care and evidence-based protocols.',
    'Analyze ethical dilemmas using established ethical frameworks'
);`);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Copy SQL
                </Button>
              </div>
              <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
{`-- Step 1: Create unified content table
CREATE TABLE vsk_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_src TEXT,
    full_audio_src TEXT,
    image_url TEXT,
    thumbnail_path TEXT,
    duration INTEGER,
    episode_number INTEGER NOT NULL DEFAULT 1,
    season INTEGER NOT NULL DEFAULT 1,
    slug TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    category TEXT,
    tags TEXT[],
    show_notes TEXT,
    transcript TEXT,
    file_size INTEGER,
    meta_title TEXT,
    meta_description TEXT,
    quiz_title TEXT,
    quiz_description TEXT,
    quiz_category TEXT,
    pass_percentage INTEGER DEFAULT 70,
    total_questions INTEGER DEFAULT 0,
    quiz_is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create questions table
CREATE TABLE vsk_content_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    rationale TEXT,
    learning_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, question_number)
);

-- Step 3: Create answers table  
CREATE TABLE vsk_content_question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, answer_letter)
);`}
              </pre>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setError(null);
                  fetchContent();
                }}
                variant="primary"
              >
                Retry Connection
              </Button>
              <Button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                variant="secondary"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">Manage podcast episodes and their associated quizzes</p>
        </div>
        <div className="flex space-x-3">
          {!showForm && (
            <Button onClick={handleCreateNew} variant="primary">
              Create New Content
            </Button>
          )}
        </div>
      </div>

      {error && error !== 'MIGRATION_NEEDED' && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
        />
      )}

      {showForm ? (
        <Card>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('podcast')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'podcast'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Podcast Details
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quiz'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quiz Questions ({formData.questions.length})
              </button>
            </nav>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {activeTab === 'podcast' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Podcast Episode Information</h3>
                
                <Input
                  label="Episode Title"
                  value={formData.title}
                  onChange={(value) => {
                    handleChange('title', value);
                    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                      handleChange('slug', generateSlug(value));
                    }
                    if (!formData.quiz_title) {
                      handleChange('quiz_title', value + ' Quiz');
                    }
                  }}
                  required
                  error={errors.title}
                />

                <TextArea
                  label="Episode Description"
                  value={formData.description}
                  onChange={(value) => handleChange('description', value)}
                  rows={3}
                  error={errors.description}
                />

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Checkbox
                    label="Published"
                    checked={formData.is_published}
                    onChange={(checked) => handleChange('is_published', checked)}
                  />

                  <Checkbox
                    label="Featured Episode"
                    checked={formData.featured}
                    onChange={(checked) => handleChange('featured', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleCategoryToggle(keyword)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedCategories.includes(keyword)
                            ? 'bg-primary-100 border-primary-300 text-primary-800'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedCategories.filter(cat => availableKeywords.includes(cat)).join(', ')}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Series
                  </label>
                  <select
                    value={formData.series_id}
                    onChange={(e) => handleChange('series_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No Series (Standalone Episode)</option>
                    {availableSeries.map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600">
                    Assign this content to a series for better organization
                  </p>
                </div>

                <FileUploadField
                  label="Preview Audio"
                  type="audio"
                  value={formData.audio_src}
                  onChange={(url, _path) => handleChange('audio_src', url)}
                  helpText="Short version for initial play"
                />

                <FileUploadField
                  label="Full Audio"
                  type="audio"
                  value={formData.full_audio_src}
                  onChange={(url, _path) => handleChange('full_audio_src', url)}
                  helpText="Complete episode for full access"
                />

                <FileUploadField
                  label="Thumbnail Image"
                  type="image"
                  value={getFormThumbnailUrl(formData)}
                  onChange={(url, _path) => {
                    handleChange('thumbnail_path', _path);
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

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Quiz Settings</h4>
                  
                  <Input
                    label="Quiz Title"
                    value={formData.quiz_title}
                    onChange={(value) => handleChange('quiz_title', value)}
                    placeholder="Auto-generated from episode title"
                  />

                  <TextArea
                    label="Quiz Description"
                    value={formData.quiz_description}
                    onChange={(value) => handleChange('quiz_description', value)}
                    rows={2}
                    placeholder="Brief description of what the quiz covers"
                  />

                  <Checkbox
                    label="Quiz Active"
                    checked={formData.quiz_is_active}
                    onChange={(checked) => handleChange('quiz_is_active', checked)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    variant="secondary"
                    size="sm"
                  >
                    Add Question
                  </Button>
                </div>

                {formData.questions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question List */}
                    <div className="lg:col-span-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Questions</h4>
                      <div className="space-y-2">
                        {formData.questions.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedQuestionIndex(index)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg border ${
                              selectedQuestionIndex === index
                                ? 'bg-primary-50 border-primary-300 text-primary-800'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
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
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-medium text-gray-900">
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
                            />

                            <TextArea
                              label="Learning Outcome"
                              value={formData.questions[selectedQuestionIndex].learning_outcome || 'Analyze and apply key veterinary nursing concepts in clinical practice scenarios'}
                              onChange={(value) => handleQuestionChange(selectedQuestionIndex, 'learning_outcome', value)}
                              rows={2}
                              placeholder="What should students learn from this question?"
                            />

                            <TextArea
                              label="Rationale"
                              value={formData.questions[selectedQuestionIndex].rationale || 'Understanding this concept is essential for safe and effective veterinary nursing practice. The correct answer demonstrates knowledge of evidence-based protocols and clinical reasoning.'}
                              onChange={(value) => handleQuestionChange(selectedQuestionIndex, 'rationale', value)}
                              rows={3}
                              placeholder="Explain why the correct answer is correct..."
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
                              <div className="space-y-3">
                                {formData.questions[selectedQuestionIndex].answers?.map((answer, answerIndex) => (
                                  <div key={answerIndex} className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                      {answer.answer_letter}
                                    </span>
                                    <Input
                                      value={answer.answer_text}
                                      onChange={(value) => handleAnswerChange(selectedQuestionIndex, answerIndex, 'answer_text', value)}
                                      placeholder={`Answer ${answer.answer_letter}`}
                                      className="flex-1"
                                    />
                                    <label className="flex items-center text-sm">
                                      <input
                                        type="checkbox"
                                        checked={answer.is_correct}
                                        onChange={(e) => handleAnswerChange(selectedQuestionIndex, answerIndex, 'is_correct', e.target.checked)}
                                        className="mr-2"
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
                  <div className="text-center py-12 text-gray-500">
                    <p>No questions yet. Click "Add Question" to get started.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t">
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
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <AdminDataTable
          title={`${content.length} ${content.length === 1 ? 'content item' : 'content items'}`}
          data={content}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="No content found. Create your first podcast episode with quiz to get started."
          onRowClick={handleEdit}
        />
      )}
    </div>
  );
}