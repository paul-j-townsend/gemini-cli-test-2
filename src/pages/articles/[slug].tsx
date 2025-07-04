import { GetServerSideProps } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  slug: string
  image_url?: string
  featured: boolean
}

interface ArticlePageProps {
  article: Article | null
  relatedArticles: Article[]
}

const ArticlePage = ({ article, relatedArticles }: ArticlePageProps) => {
  // Track article view
  useEffect(() => {
    const trackView = async () => {
      if (article?.id) {
        try {
          await supabase.rpc('increment_article_views', { article_id: article.id })
          console.log('View tracked')
        } catch (err) {
          console.error('Error tracking view:', err)
        }
      }
    }
    trackView()
  }, [article?.id])

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/articles" className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to Articles
          </Link>
        </div>
      </Layout>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <Head>
        <title>{article.title} - Vet Sidekick</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <style>{`
          .no-focus-border:focus,
          .no-focus-border:active,
          .no-focus-border:focus-visible,
          .no-focus-border:focus-within {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
        `}</style>
      </Head>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/articles" className="text-gray-500 hover:text-gray-700">
                Articles
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">
              {article.category?.split(',').map((cat, index) => (
                <span key={index}>
                  {cat.trim()}
                  {index < article.category.split(',').length - 1 && ', '}
                </span>
              ))}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {article.category?.split(',').map((cat, index) => (
                <span key={index} className="inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded-full">
                  {cat.trim()}
                </span>
              ))}
            </div>
            {article.featured && (
              <span className="inline-block px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-gray-600">
            <div>
              <span>By: </span>
              <span className="font-medium text-gray-900">{article.author}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image_url && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Article Footer */}
        <footer className="border-t pt-8">
          <div className="flex items-center justify-end mb-8">
            <Link 
              href="/articles" 
              className="text-teal-600 hover:text-teal-700 font-medium no-focus-border"
              style={{ 
                outline: 'none', 
                border: 'none',
                boxShadow: 'none',
                textDecoration: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
            >
              ← Back to Articles
            </Link>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/articles/${related.slug}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4 p-4">
                      {related.image_url ? (
                        <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={related.image_url}
                            alt={related.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 rounded bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white opacity-50"
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {related.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </footer>
      </article>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string

  // Fetch the article
  const { data: article, error: articleError } = await supabase
    .from('vsk_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (articleError || !article) {
    return {
      props: {
        article: null,
        relatedArticles: []
      }
    }
  }

  // Fetch related articles from the same category
  const { data: relatedArticles } = await supabase
    .from('vsk_articles')
    .select('id, title, excerpt, slug, image_url')
    .eq('category', article.category)
    .eq('published', true)
    .neq('id', article.id)
    .limit(4)
            .order('id', { ascending: false })

  return {
    props: {
      article,
      relatedArticles: relatedArticles || []
    }
  }
}

export default ArticlePage 