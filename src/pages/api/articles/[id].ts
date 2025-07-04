import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Article ID is required' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        return await updateArticle(req, res, parseInt(id));
      case 'DELETE':
        return await deleteArticle(req, res, parseInt(id));
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateArticle(req: NextApiRequest, res: NextApiResponse, id: number) {
  const { title, content, excerpt, author, category, published, featured, slug } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { data: article, error } = await supabase
    .from('vsk_articles')
    .update({
      title,
      content,
      excerpt,
      author,
      category,
      published: published || false,
      featured: featured || false,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    return res.status(500).json({ message: 'Failed to update article' });
  }

  return res.status(200).json(article);
}

async function deleteArticle(req: NextApiRequest, res: NextApiResponse, id: number) {
  const { error } = await supabase
    .from('vsk_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return res.status(500).json({ message: 'Failed to delete article' });
  }

  return res.status(200).json({ message: 'Article deleted successfully' });
} 