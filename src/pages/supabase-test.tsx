import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

interface TestItem {
  id: number
  name: string
  description: string
  created_at: string
}

const SupabaseTest = () => {
  const [items, setItems] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('test_items').select('count', { count: 'exact', head: true })
      if (error && error.code === '42P01') {
        setConnectionStatus('connected')
        setError('Table "test_items" does not exist. You can create it manually in your Supabase dashboard.')
      } else if (error) {
        setConnectionStatus('error')
        setError(`Connection error: ${error.message}`)
      } else {
        setConnectionStatus('connected')
        setError(null)
      }
    } catch (err) {
      setConnectionStatus('error')
      setError('Failed to connect to Supabase. Please check your configuration.')
    }
  }

  // Fetch items from Supabase
  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('test_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          setError('Table "test_items" does not exist. Please create it in your Supabase dashboard.')
        } else {
          setError(`Error fetching items: ${error.message}`)
        }
      } else {
        setItems(data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  // Add new item
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    try {
      const { data, error } = await supabase
        .from('test_items')
        .insert([
          {
            name: newItemName.trim(),
            description: newItemDescription.trim()
          }
        ])
        .select()

      if (error) {
        setError(`Error adding item: ${error.message}`)
      } else {
        setNewItemName('')
        setNewItemDescription('')
        fetchItems()
      }
    } catch (err) {
      setError('Failed to add item')
    }
  }

  // Delete item
  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from('test_items')
        .delete()
        .eq('id', id)

      if (error) {
        setError(`Error deleting item: ${error.message}`)
      } else {
        fetchItems()
      }
    } catch (err) {
      setError('Failed to delete item')
    }
  }

  useEffect(() => {
    testConnection()
    fetchItems()
  }, [])

  return (
    <Layout>
      <Head>
        <title>Supabase Test - Vet Sidekick</title>
        <meta name="description" content="Test page for Supabase integration" />
      </Head>

      <div className="container-wide py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 mb-8">Supabase Test Page</h1>
          
          {/* Connection Status */}
          <div className="card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center space-x-3">
              {connectionStatus === 'checking' && (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Checking connection...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">Connected to Supabase</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700">Connection failed</span>
                </>
              )}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Setup Instructions</h2>
            <div className="space-y-4 text-blue-800">
              <p>To use this test page, you need to:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create a Supabase project at supabase.com</li>
                <li>Add your Supabase URL and anon key to your environment variables</li>
                <li>Create a table called test_items</li>
              </ol>
            </div>
          </div>

          {error && (
            <div className="card p-6 mb-8 bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Add Item Form */}
          <div className="card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add Test Item</h2>
            <form onSubmit={addItem} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="input"
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={!newItemName.trim()}
              >
                Add Item
              </button>
            </form>
          </div>

          {/* Items List */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-4">Test Items</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3">Loading items...</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No items found. Add your first item above!
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-neutral-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-sm text-neutral-400 mt-2">
                          Created: {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                        title="Delete item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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

export default SupabaseTest 