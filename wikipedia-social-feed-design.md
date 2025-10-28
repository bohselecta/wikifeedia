# Wikifeedia: AI-Curated Wikipedia Social Platform
## Complete System Design Document

---

## 🎯 Project Overview

A Reddit/TikTok-style social feed that displays AI-curated "posts" from Wikipedia content. Uses local Ollama + Gemma 3 4b to mine Wikipedia 24/7, creating engaging posts with titles that hook readers. Includes subreddit-style categories, filtering, and optional AI-generated comment discussions.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Web App)                       │
│  - Next.js/React                                             │
│  - Infinite scroll feed                                      │
│  - Category filtering                                        │
│  - Post interactions (upvote, comment)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js/Python)               │
│  - Serve posts to frontend                                   │
│  - Handle user interactions                                  │
│  - Manage categories & filters                               │
└─────────────────────────────────────────────────────────────┘
                              ↓ Database queries
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  - Posts (generated content)                                 │
│  - Categories                                                │
│  - Comments (AI & potential real users)                      │
│  - User preferences                                          │
└─────────────────────────────────────────────────────────────┘
                              ↑ Continuous writes
┌─────────────────────────────────────────────────────────────┐
│              AI CONTENT GENERATOR (Background Service)       │
│  - Cron job running 24/7                                     │
│  - Ollama + Gemma 3 4b                                       │
│  - Mines Wikipedia dump                                      │
│  - Generates posts & AI comments                             │
└─────────────────────────────────────────────────────────────┘
                              ↑ Reads from
┌─────────────────────────────────────────────────────────────┐
│                  WIKIPEDIA DUMP (Local Storage)              │
│  - Downloaded XML/SQL dump                                   │
│  - ~20GB compressed, ~90GB uncompressed                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### 1. Wikipedia Data Layer

**Setup:**
```bash
# Download latest Wikipedia dump
wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2

# Install WikiExtractor for parsing
pip install wikiextractor

# Extract to JSON format
wikiextractor --json -o extracted_wiki enwiki-latest-pages-articles.xml.bz2
```

**Database Schema for Wiki Content:**
```sql
CREATE TABLE wiki_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    url VARCHAR(500),
    categories TEXT[], -- Wikipedia's own categories
    last_processed TIMESTAMP,
    times_used INTEGER DEFAULT 0,
    quality_score FLOAT -- AI-assigned interestingness score
);

CREATE INDEX idx_categories ON wiki_articles USING GIN(categories);
CREATE INDEX idx_quality ON wiki_articles(quality_score DESC);
CREATE INDEX idx_times_used ON wiki_articles(times_used);
```

---

### 2. AI Content Generator (The Heart)

**Technology Stack:**
- **Ollama** with **Gemma 3 4b** (fast, runs locally, great for this use case)
- **Python** background service
- **Cron scheduling** or systemd timer

**Core Workflow:**

```python
# content_generator.py

import ollama
import random
import psycopg2
from datetime import datetime
import json

class WikiPostGenerator:
    def __init__(self):
        self.ollama_model = "gemma2:4b"
        self.db_conn = psycopg2.connect("dbname=wikifeedia user=postgres")
        
    def generate_post_batch(self, batch_size=10):
        """Generate a batch of posts"""
        for _ in range(batch_size):
            article = self.select_interesting_article()
            if article:
                post = self.create_engaging_post(article)
                if post and post['quality_score'] > 6.0:  # Only save good posts
                    self.save_post(post)
                    self.generate_ai_comments(post['id'], num_comments=random.randint(3, 12))
    
    def select_interesting_article(self):
        """Smart article selection strategy"""
        cursor = self.db_conn.cursor()
        
        # Strategy: Mix of untouched articles, high-quality, and underused
        strategy = random.choice(['fresh', 'quality', 'underused'])
        
        if strategy == 'fresh':
            # Never processed before
            cursor.execute("""
                SELECT * FROM wiki_articles 
                WHERE last_processed IS NULL 
                ORDER BY RANDOM() LIMIT 1
            """)
        elif strategy == 'quality':
            # High quality but not overused
            cursor.execute("""
                SELECT * FROM wiki_articles 
                WHERE quality_score > 7.0 AND times_used < 3
                ORDER BY RANDOM() LIMIT 1
            """)
        else:
            # Underused good content
            cursor.execute("""
                SELECT * FROM wiki_articles 
                WHERE times_used < 2 AND quality_score > 5.0
                ORDER BY RANDOM() LIMIT 1
            """)
        
        return cursor.fetchone()
    
    def create_engaging_post(self, article):
        """Use Ollama to create an engaging social media post from Wikipedia content"""
        
        prompt = f"""You are a social media content creator for a Wikipedia-based platform. 
Your job is to take Wikipedia content and make it FASCINATING.

Wikipedia Article: {article['title']}
Content: {article['content'][:3000]}  # Truncate for context

Create a social media post with:
1. A HOOK TITLE (10-15 words max) that makes people NEED to click
2. The most interesting 2-3 facts/stories from this article
3. A category tag (e.g., History, Science, Technology, Nature, Culture, etc.)
4. A "why this matters" or "mind-blowing connection" angle

Format your response as JSON:
{{
    "title": "The hook title here",
    "content": "The engaging content here (2-4 paragraphs, conversational tone)",
    "category": "Category name",
    "tags": ["tag1", "tag2", "tag3"],
    "quality_score": 7.5,  // Your assessment 1-10 of how interesting this is
    "tldr": "One sentence that captures why this is cool"
}}

Make it punchy, make it interesting, make people want to read it. Think r/todayilearned quality."""

        response = ollama.generate(model=self.ollama_model, prompt=prompt)
        
        try:
            post_data = json.loads(response['response'])
            post_data['source_article_id'] = article['id']
            post_data['wiki_url'] = article['url']
            return post_data
        except:
            return None
    
    def save_post(self, post):
        """Save generated post to database"""
        cursor = self.db_conn.cursor()
        cursor.execute("""
            INSERT INTO posts (title, content, category, tags, quality_score, 
                             source_article_id, wiki_url, tldr, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            RETURNING id
        """, (post['title'], post['content'], post['category'], post['tags'],
              post['quality_score'], post['source_article_id'], post['wiki_url'],
              post['tldr']))
        
        post_id = cursor.fetchone()[0]
        self.db_conn.commit()
        return post_id
    
    def generate_ai_comments(self, post_id, num_comments=5):
        """Generate AI persona comments for the post"""
        
        cursor = self.db_conn.cursor()
        cursor.execute("SELECT title, content FROM posts WHERE id = %s", (post_id,))
        post = cursor.fetchone()
        
        # Different AI personas
        personas = [
            {"name": "HistoryBuff1987", "style": "enthusiastic historian, loves to add context"},
            {"name": "ScienceNerd_", "style": "skeptical scientist, asks good questions"},
            {"name": "CasualLurker", "style": "casual reader, reacts with 'wow' and simple thoughts"},
            {"name": "DevilsAdvocate99", "style": "contrarian who politely challenges assumptions"},
            {"name": "FunFactBot", "style": "adds related fun facts and connections"},
            {"name": "SourceChecker", "style": "asks for sources and verification"},
            {"name": "ELI5_Please", "style": "asks for simpler explanations"},
            {"name": "PunMaster3000", "style": "makes dad jokes and puns about the topic"},
        ]
        
        selected_personas = random.sample(personas, min(num_comments, len(personas)))
        
        for persona in selected_personas:
            comment = self.generate_single_comment(post, persona)
            if comment:
                cursor.execute("""
                    INSERT INTO comments (post_id, username, content, is_ai, created_at)
                    VALUES (%s, %s, %s, true, NOW())
                """, (post_id, persona['name'], comment))
        
        self.db_conn.commit()
    
    def generate_single_comment(self, post, persona):
        """Generate a single AI comment in a specific persona"""
        
        prompt = f"""You are {persona['name']}, a commenter on a Wikipedia social feed.
Your style: {persona['style']}

Post title: {post[0]}
Post content: {post[1][:500]}

Write a comment (2-4 sentences) responding to this post. Stay in character.
Be conversational, natural, like a real Reddit comment. No hashtags. No emojis (maybe 1 max).
Just respond with the comment text, nothing else."""

        response = ollama.generate(model=self.ollama_model, prompt=prompt)
        return response['response'].strip()


# Main execution loop
if __name__ == "__main__":
    generator = WikiPostGenerator()
    
    # Run continuously
    while True:
        print(f"[{datetime.now()}] Generating post batch...")
        generator.generate_post_batch(batch_size=5)
        
        # Wait 10 minutes between batches (adjust based on your CPU)
        import time
        time.sleep(600)
```

---

### 3. Database Schema

```sql
-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
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

-- Categories table (predefined)
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

-- User preferences (if you add real users later)
CREATE TABLE user_preferences (
    user_id VARCHAR(100) PRIMARY KEY,
    subscribed_categories TEXT[],
    hidden_categories TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4. Backend API (Node.js/Express)

```javascript
// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
    user: 'postgres',
    database: 'wikifeedia',
    password: 'your_password',
    port: 5432,
});

app.use(cors());
app.use(express.json());

// Get feed posts (infinite scroll)
app.get('/api/posts', async (req, res) => {
    const { 
        category, 
        limit = 20, 
        offset = 0,
        sort = 'recent' // 'recent', 'top', 'random'
    } = req.query;
    
    let query = `
        SELECT 
            p.*,
            c.name as category_name,
            c.color as category_color,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN categories c ON p.category = c.name
    `;
    
    let conditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (category) {
        conditions.push(`p.category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Sorting
    if (sort === 'top') {
        query += ' ORDER BY p.upvotes DESC, p.created_at DESC';
    } else if (sort === 'random') {
        query += ' ORDER BY RANDOM()';
    } else {
        query += ' ORDER BY p.created_at DESC';
    }
    
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single post with comments
app.get('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;
    
    try {
        // Get post
        const postResult = await pool.query(
            'SELECT * FROM posts WHERE id = $1',
            [postId]
        );
        
        if (postResult.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Get comments
        const commentsResult = await pool.query(
            'SELECT * FROM comments WHERE post_id = $1 ORDER BY upvotes DESC, created_at ASC',
            [postId]
        );
        
        // Increment view count
        await pool.query(
            'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
            [postId]
        );
        
        res.json({
            post: postResult.rows[0],
            comments: commentsResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upvote post
app.post('/api/posts/:id/upvote', async (req, res) => {
    const postId = req.params.id;
    
    try {
        await pool.query(
            'UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1',
            [postId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categories ORDER BY name'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
```

---

### 5. Frontend (Next.js/React)

```jsx
// pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    
    const observer = useRef();
    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);
    
    const loadMorePosts = async () => {
        setLoading(true);
        const response = await fetch(
            `/api/posts?limit=20&offset=${offset}${
                selectedCategory ? `&category=${selectedCategory}` : ''
            }`
        );
        const newPosts = await response.json();
        
        if (newPosts.length === 0) {
            setHasMore(false);
        } else {
            setPosts(prev => [...prev, ...newPosts]);
            setOffset(prev => prev + 20);
        }
        setLoading(false);
    };
    
    useEffect(() => {
        setPosts([]);
        setOffset(0);
        setHasMore(true);
        loadMorePosts();
    }, [selectedCategory]);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        📚 Wikifeedia
                    </h1>
                    <p className="text-gray-600 text-sm">
                        AI-curated interesting stuff from Wikipedia
                    </p>
                </div>
            </header>
            
            <CategoryFilter 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            
            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="space-y-4">
                    {posts.map((post, index) => {
                        if (posts.length === index + 1) {
                            return (
                                <div ref={lastPostRef} key={post.id}>
                                    <PostCard post={post} />
                                </div>
                            );
                        } else {
                            return <PostCard key={post.id} post={post} />;
                        }
                    })}
                </div>
                
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
                {!hasMore && (
                    <div className="text-center py-8 text-gray-500">
                        You've reached the end! (For now... the AI is generating more)
                    </div>
                )}
            </main>
        </div>
    );
}

// components/PostCard.js
import Link from 'next/link';

export default function PostCard({ post }) {
    const handleUpvote = async () => {
        await fetch(`/api/posts/${post.id}/upvote`, { method: 'POST' });
        // Optimistic UI update
        post.upvotes += 1;
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            {/* Category tag */}
            <div className="flex items-center gap-2 mb-3">
                <span 
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: post.category_color }}
                >
                    {post.category_name}
                </span>
                <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                </span>
            </div>
            
            {/* Title */}
            <Link href={`/post/${post.id}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                    {post.title}
                </h2>
            </Link>
            
            {/* TLDR */}
            <p className="text-gray-600 italic mb-4 border-l-4 border-blue-500 pl-3">
                {post.tldr}
            </p>
            
            {/* Content preview */}
            <div className="text-gray-800 mb-4 line-clamp-4">
                {post.content}
            </div>
            
            {/* Interaction bar */}
            <div className="flex items-center gap-6 text-sm text-gray-600 border-t pt-3">
                <button 
                    onClick={handleUpvote}
                    className="flex items-center gap-1 hover:text-orange-500"
                >
                    <span>⬆</span>
                    <span>{post.upvotes}</span>
                </button>
                
                <Link href={`/post/${post.id}`}>
                    <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <span>💬</span>
                        <span>{post.comment_count} comments</span>
                    </span>
                </Link>
                
                <a 
                    href={post.wiki_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-500"
                >
                    <span>📖</span>
                    <span>Wikipedia</span>
                </a>
                
                <span className="flex items-center gap-1">
                    <span>👁</span>
                    <span>{post.view_count} views</span>
                </span>
            </div>
        </div>
    );
}

// components/CategoryFilter.js
import { useState, useEffect } from 'react';

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(setCategories);
    }, []);
    
    return (
        <div className="bg-white border-b sticky top-16 z-9">
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                            selectedCategory === null
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                selectedCategory === cat.name
                                    ? 'text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={
                                selectedCategory === cat.name
                                    ? { backgroundColor: cat.color }
                                    : {}
                            }
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

---

## 🚀 Deployment & Setup Instructions

### 1. Install Dependencies

```bash
# System dependencies
sudo apt-get update
sudo apt-get install postgresql python3-pip nodejs npm

# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma2:4b

# Python packages
pip install ollama psycopg2-binary wikiextractor

# Node packages
npm install express pg cors
cd frontend && npm install next react react-dom
```

### 2. Database Setup

```bash
# Create database
createdb wikifeedia

# Run schema
psql wikifeedia < schema.sql
```

### 3. Download & Process Wikipedia

```bash
# Download (this will take a while - ~20GB)
wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2

# Extract
wikiextractor --json -o extracted_wiki enwiki-latest-pages-articles.xml.bz2

# Import to database (you'll need to write a script for this)
python import_wiki_to_db.py
```

### 4. Start Content Generator

```bash
# Run as background service
python content_generator.py &

# Or use systemd
sudo systemctl start wikifeed-generator
```

### 5. Start Backend API

```bash
node server.js
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

---

## 🎨 Content Strategy Tips

### Making Posts Engaging

The AI prompt engineering is KEY. Here's what makes posts shareable:

1. **Hook Titles:**
   - "This 14th-century monk predicted the internet... in 1495"
   - "The CIA's weirdest experiment involved 20 cats and $20 million"
   - "There's a town in Norway where it's illegal to die"

2. **Content Structure:**
   - Start with the most interesting fact
   - Add context that makes it relatable
   - End with a "mind-blown" connection or question

3. **Category Distribution:**
   - Weight certain categories higher (History, Mystery, Science)
   - Rotate categories to keep feed diverse
   - Track which categories get most engagement

### AI Comment Personas

Make them feel real but fun:
- **HistoryBuff1987**: Always adds historical context
- **ScienceNerd_**: Questions methodology, asks for sources
- **CasualLurker**: "TIL!", "Wait, what?", "This is insane"
- **PunMaster3000**: Makes terrible puns about serious topics
- **DevilsAdvocate99**: Politely challenges with "But what about..."

---

## 📊 Performance Optimization

### For 24/7 Generation:

```python
# Batch processing for efficiency
BATCH_SIZE = 10  # Generate 10 posts per run
DELAY_BETWEEN_BATCHES = 600  # 10 minutes

# Quality filtering
MIN_QUALITY_SCORE = 6.0  # Only save good posts
TARGET_POST_BUFFER = 500  # Keep 500+ posts ready

# CPU management
# Gemma 3 4b should use ~4GB RAM
# Can run multiple processes if you have 16GB+ RAM
```

### Database Indexing:

```sql
-- Speed up feed queries
CREATE INDEX idx_composite_feed ON posts(created_at DESC, quality_score DESC);

-- Speed up category filtering
CREATE INDEX idx_category_created ON posts(category, created_at DESC);
```

---

## 🎭 Optional: Advanced Features

### 1. Trending Algorithm

```python
def calculate_trending_score(post):
    age_hours = (datetime.now() - post.created_at).total_seconds() / 3600
    return (post.upvotes + post.comment_count * 2) / (age_hours + 2) ** 1.5
```

### 2. Related Posts

Use embeddings to find similar posts:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode(post.content)
# Store in pgvector for similarity search
```

### 3. AI Comment Threads

Make AI personas reply to each other:
```python
# After generating initial comments, create 2-3 follow-up replies
# Keep thread depth to 2-3 levels max for realism
```

---

## 🔧 Systemd Service (Optional)

```ini
# /etc/systemd/system/wikifeedia-generator.service
[Unit]
Description=Wikifeedia Content Generator
After=network.target postgresql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/home/your_user/wikifeedia
ExecStart=/usr/bin/python3 content_generator.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable wikifeedia-generator
sudo systemctl start wikifeedia-generator
```

---

## 📈 Monitoring

Track generation metrics:

```python
import logging

logging.basicConfig(
    filename='wikifeedia_generator.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

# Log every batch
logging.info(f"Generated {batch_count} posts. Queue size: {queue_size}")
```

---

## 🎉 Fun Ideas

1. **Daily Digest Email**: "Top 10 Wikifeedia posts today"
2. **"Deep Dive" Mode**: AI generates longer essays on request
3. **Controversy Score**: Track which posts spark most debate
4. **Time Travel**: Filter posts by historical era
5. **"Surprise Me"**: Random high-quality post button
6. **Collections**: Let AI create themed post collections

---

## Summary

This system will:
- ✅ Run 24/7 generating interesting Wikipedia posts
- ✅ Use local Ollama (no API costs)
- ✅ Create engaging titles and content
- ✅ Organize into categories like subreddits
- ✅ Generate AI comment discussions
- ✅ Scale based on your hardware
- ✅ Provide infinite scroll entertainment

**Total Cost**: $0 (just your electricity and internet for Wikipedia dump)

Let me know if you want me to code up any specific component! This is honestly a really fun project. 🚀
