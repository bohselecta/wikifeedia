const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'wikifeedia',
    user: process.env.DB_USER || 'wikifeedia_user',
    password: process.env.DB_PASSWORD || 'changeme',
    port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get feed posts (infinite scroll)
app.get('/api/posts', async (req, res) => {
    const { 
        category, 
        limit = 20, 
        offset = 0,
        sort = 'recent' // 'recent', 'hot', 'top', 'random'
    } = req.query;
    
    let query = `
        SELECT 
            p.*,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
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
    if (sort === 'hot') {
        query += ' ORDER BY (upvotes + comment_count * 2) DESC / EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 DESC, created_at DESC';
    } else if (sort === 'top') {
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
        console.error('Error fetching posts:', error);
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
        console.error('Error fetching post:', error);
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
        console.error('Error upvoting post:', error);
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
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get post stats
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_posts,
                SUM(upvotes) as total_upvotes,
                (SELECT COUNT(*) FROM comments) as total_comments
            FROM posts
        `);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`📚 Wikifeedia API server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}/api/health to check status`);
});

