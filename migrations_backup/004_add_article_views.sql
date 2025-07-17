-- Add views column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create an index on views for performance
CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(views DESC);

-- Create a function to increment views
CREATE OR REPLACE FUNCTION increment_article_views(article_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Add views to existing articles (random values for demo)
UPDATE articles 
SET views = floor(random() * 1000 + 1)
WHERE views = 0; 