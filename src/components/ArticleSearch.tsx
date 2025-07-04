import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import debounce from 'lodash.debounce'

interface Article {
  id: number
  title: string
  excerpt: string
  slug: string
  category: string
}

interface ArticleSearchProps {
  onSearchResults: (articles: Article[] | null) => void
  onSearching: (isSearching: boolean) => void
}

const ArticleSearch = ({ onSearchResults, onSearching }: ArticleSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearching, setShowSearching] = useState(false)
  const activeSearchRef = useRef<string | null>(null)

  // Create the search function
  const performSearch = useCallback(async (term: string) => {
    // Store the current search term
    activeSearchRef.current = term

    if (!term.trim()) {
      onSearchResults(null)
      onSearching(false)
      setShowSearching(false)
      activeSearchRef.current = null
      return
    }

    // Only show searching indicator after a small delay to prevent flickering
    const searchingTimer = setTimeout(() => {
      if (activeSearchRef.current === term) {
        setShowSearching(true)
        onSearching(true)
      }
    }, 200)

    try {
      const { data, error } = await supabase
        .from('vsk_articles')
        .select('id, title, excerpt, slug, category')
        .eq('published', true)
        .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
        .order('id', { ascending: false })
        .limit(10)

      // Only update if this is still the active search
      if (activeSearchRef.current === term) {
        if (error) throw error
        onSearchResults(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      if (activeSearchRef.current === term) {
        onSearchResults([])
      }
    } finally {
      clearTimeout(searchingTimer)
      if (activeSearchRef.current === term) {
        setShowSearching(false)
        onSearching(false)
      }
    }
  }, [onSearchResults, onSearching])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      performSearch(term)
    }, 500),
    [performSearch]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    
    return () => {
      debouncedSearch.cancel()
      activeSearchRef.current = null
    }
  }, [searchTerm, debouncedSearch])

  const handleClear = () => {
    activeSearchRef.current = null
    debouncedSearch.cancel()
    setSearchTerm('')
    setShowSearching(false)
    onSearching(false)
    onSearchResults(null)
  }

  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles by title, content, or excerpt..."
          className="w-full px-4 py-3 pl-12 pr-10 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            type="button"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {showSearching && (
        <div className="absolute inset-x-0 top-full mt-1 flex items-center justify-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  )
}

export default ArticleSearch 