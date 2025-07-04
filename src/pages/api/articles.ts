import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getArticles(req, res);
      case 'POST':
        return await createArticle(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getArticles(req: NextApiRequest, res: NextApiResponse) {
  const { data: articles, error } = await supabase
    .from('vsk_articles')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ message: 'Failed to fetch articles' });
  }

  return res.status(200).json(articles || []);
}

async function createArticle(req: NextApiRequest, res: NextApiResponse) {
  const { title, content, excerpt, author, category, published, featured, slug } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { data: article, error } = await supabase
    .from('vsk_articles')
    .insert([
      {
        title,
        content,
        excerpt,
        author,
        category,
        published: published || false,
        featured: featured || false,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({ message: 'Failed to create article' });
  }

  return res.status(201).json(article);
} 