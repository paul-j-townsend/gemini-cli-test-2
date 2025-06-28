import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import ArticleSearch from '@/components/ArticleSearch'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  category: string
  slug: string
  created_at: string
  image_url?: string
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<Article[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [selectedCategory])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('vsk_articles')
        .select('id, title, excerpt, author, category, slug, created_at, image_url')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
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

      if (error) throw error
      setCategories(data?.map((item: any) => item.keyword) || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSearchResults = (results: Article[] | null) => {
    setSearchResults(results)
  }

  const displayedArticles = searchResults !== null ? searchResults : articles

  return (
    <Layout>
      <Head>
        <title>Articles - Vet Sidekick</title>
        <meta name="description" content="Read the latest veterinary articles and insights" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Veterinary Articles & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest in veterinary medicine, best practices, and industry insights
          </p>
        </div>

        {/* Search Component */}
        <ArticleSearch 
          onSearchResults={handleSearchResults}
          onSearching={setIsSearching}
        />

        {/* Category Filter - Hide during search */}
        {!searchResults && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Articles
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
                      ))}
          </div>
        )}

        {/* Search Results Header */}
        {searchResults && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {loading && !searchResults ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        ) : isSearching ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchResults !== null ? 'No articles found matching your search.' : 'No articles found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/articles/${article.slug}`} className="block">
                  {article.image_url ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-white opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                        {article.category}
                      </span>
                      <time className="text-xs text-gray-500">
                        {formatDate(article.created_at)}
                      </time>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        By: {article.author}
                      </span>
                      <span className="text-teal-600 font-medium text-sm hover:text-teal-700">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Articles 