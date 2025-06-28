import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  published: boolean
  featured: boolean
  slug: string
  created_at: string
  updated_at: string
  original_url: string
}

const ArticlesTest = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null)
  
  // Form state
  const initialFormData = {
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    published: false,
    featured: false,
    slug: ''
  };
  const [formData, setFormData] = useState(initialFormData)

  // Fetch articles from Supabase
  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vsk_articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          setError('Table "articles" does not exist. Please run the migration script.')
        } else {
          setError(`Error fetching articles: ${error.message}`)
        }
      } else {
        setArticles(data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('vsk_valid_keywords')
        .select('keyword')
        .order('keyword', { ascending: true })

      if (error) {
        console.error(`Error fetching categories: ${error.message}`)
      } else {
        setCategories(data?.map((item: any) => item.keyword) || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingArticleId(null);
    setShowForm(false);
  };

  // Handle form submission for create and update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const slug = formData.slug || generateSlug(formData.title)
    
    const articleData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      author: formData.author,
      category: formData.category,
      published: formData.published,
      featured: formData.featured,
      slug: slug
    }

    try {
      let error;
      if (editingArticleId) {
        const { error: updateError } = await supabase
          .from('vsk_articles')
          .update(articleData)
          .eq('id', editingArticleId)
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vsk_articles')
          .insert([articleData])
        error = insertError;
      }

      if (error) {
        setError(`Error saving article: ${error.message}`)
        return
      }

      resetForm()
      fetchArticles()
    } catch (err) {
      setError('Failed to save article')
    }
  }

  // Delete article
  const deleteArticle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const { error } = await supabase
        .from('vsk_articles')
        .delete()
        .eq('id', id)

      if (error) {
        setError(`Error deleting article: ${error.message}`)
      } else {
        fetchArticles()
      }
    } catch (err) {
      setError('Failed to delete article')
    }
  }

  const handleEdit = (article: Article) => {
    setEditingArticleId(article.id)
    setFormData(article)
    setShowForm(true)
  }

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [])

  return (
    <Layout>
      <Head>
        <title>Articles Management - Vet Sidekick</title>
        <meta name="description" content="Manage articles in Supabase" />
      </Head>

      <div className="container-wide py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-neutral-900">Articles Management</h1>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add Article'}
            </button>
          </div>

          {/* Setup Instructions */}
          <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Setup Instructions</h2>
            <div className="space-y-4 text-blue-800">
              <p>To use this articles management system:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Copy the SQL from the migration file</li>
                <li>Run it in your Supabase SQL Editor</li>
                <li>The table will be created with sample data</li>
              </ol>
            </div>
          </div>

          {error && (
            <div className="card p-6 mb-8 bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Article Form */}
          {showForm && (
            <div className="card p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                {editingArticleId ? 'Edit Article' : 'Add New Article'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      placeholder="Enter article title"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-neutral-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="input"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 mb-2">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input"
                    placeholder="auto-generated-from-title"
                  />
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input"
                    rows={6}
                    placeholder="Article content"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="mr-2"
                    />
                    Published
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!formData.title.trim()}
                >
                  {editingArticleId ? 'Update Article' : 'Create Article'}
                </button>
              </form>
            </div>
          )}

          {/* Articles List */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-4">Articles</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3">Loading articles...</span>
              </div>
            ) : articles.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No articles found. Create your first article above!
              </p>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="border border-neutral-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-neutral-900">{article.title}</h3>
                          <div className="flex items-center space-x-2">
                            {article.published && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Published
                              </span>
                            )}
                            {article.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {article.excerpt && (
                          <p className="text-neutral-600 mb-3">{article.excerpt}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                          {article.author && <span>By {article.author}</span>}
                          {article.category && <span>• {article.category}</span>}
                          <span>• {new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit article"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete article"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ArticlesTest 