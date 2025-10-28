-- Wikifeedia Database Schema

-- Wikipedia articles table (original content)
CREATE TABLE wiki_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    url VARCHAR(500),
    categories TEXT[], -- Wikipedia's own categories
    images TEXT[], -- Extracted image URLs from article
    last_processed TIMESTAMP,
    times_used INTEGER DEFAULT 0,
    quality_score FLOAT -- AI-assigned interestingness score
);

CREATE INDEX idx_categories ON wiki_articles USING GIN(categories);
CREATE INDEX idx_quality ON wiki_articles(quality_score DESC);
CREATE INDEX idx_times_used ON wiki_articles(times_used);

-- Generated posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
    images TEXT[], -- Wikimedia Commons URLs
    quality_score FLOAT,
    source_article_id INTEGER REFERENCES wiki_articles(id),
    wiki_url VARCHAR(500),
    tldr TEXT,
    upvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_category ON posts(category);
CREATE INDEX idx_created_at ON posts(created_at DESC);
CREATE INDEX idx_quality ON posts(quality_score DESC);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_comments ON comments(post_id, created_at DESC);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    post_count INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('History', 'Historical events, figures, and civilizations', '#8B4513'),
('Science', 'Scientific discoveries, theories, and researchers', '#4169E1'),
('Technology', 'Inventions, innovations, and tech history', '#32CD32'),
('Nature', 'Animals, plants, geology, and natural phenomena', '#228B22'),
('Culture', 'Art, literature, music, and cultural movements', '#FF69B4'),
('Geography', 'Places, cities, countries, and landmarks', '#20B2AA'),
('Biography', 'Notable people and their lives', '#FF8C00'),
('Mystery', 'Unsolved mysteries, strange phenomena, conspiracy theories', '#9370DB'),
('Sports', 'Athletes, games, and sporting history', '#FF6347'),
('Space', 'Astronomy, space exploration, and the cosmos', '#191970');

-- User preferences (for future expansion)
CREATE TABLE user_preferences (
    user_id VARCHAR(100) PRIMARY KEY,
    subscribed_categories TEXT[],
    hidden_categories TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

