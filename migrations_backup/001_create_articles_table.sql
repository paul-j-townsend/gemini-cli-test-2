-- Create articles table
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  original_url TEXT,
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create index on slug for faster lookups
CREATE INDEX idx_articles_slug ON articles(slug);

-- Create index on published and featured for filtering
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_featured ON articles(featured);

-- Create index on category for filtering
CREATE INDEX idx_articles_category ON articles(category);

-- Create index on created_at for ordering
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data
INSERT INTO articles (title, content, excerpt, author, category, published, slug) VALUES 
('Introduction to Veterinary Medicine', 'This is a comprehensive guide to veterinary medicine...', 'A comprehensive guide covering the basics of veterinary medicine.', 'Dr. Sarah Mitchell', 'Education', true, 'introduction-to-veterinary-medicine'),
('Latest Advances in Animal Surgery', 'Recent developments in surgical techniques...', 'Exploring the latest surgical techniques and technologies.', 'Dr. James Cooper', 'Surgery', true, 'latest-advances-in-animal-surgery'),
('Preventive Care for Companion Animals', 'Prevention is better than cure...', 'Essential preventive care measures for pets.', 'Dr. Emily Chen', 'Preventive Care', false, 'preventive-care-for-companion-animals'); 