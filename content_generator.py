#!/usr/bin/env python3
"""
Wikifeedia AI Content Generator

This service runs 24/7, using DeepSeek API to mine Wikipedia and generate
engaging social media posts with AI-generated comments.
"""

import os
from openai import OpenAI
import random
import psycopg2
from datetime import datetime
import json
import logging
import time
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    filename='wikifeedia_generator.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class WikiPostGenerator:
    def __init__(self):
        """Initialize the generator with environment variables."""
        
        # Get API key from environment
        api_key = os.getenv('DEEPSEEK_API_KEY')
        if not api_key:
            logging.error("DEEPSEEK_API_KEY not found in environment variables")
            sys.exit(1)
        
        # Initialize OpenAI client (DeepSeek uses OpenAI-compatible API)
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com/v1"
        )
        self.model = "deepseek-chat"
        
        # Database configuration from environment
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'name': os.getenv('DB_NAME', 'wikifeedia'),
            'user': os.getenv('DB_USER', 'wikifeedia_user'),
            'password': os.getenv('DB_PASSWORD', 'changeme')
        }
        
        # Generator configuration
        self.generator_config = {
            'batch_size': int(os.getenv('BATCH_SIZE', 5)),
            'batch_delay_seconds': int(os.getenv('BATCH_DELAY_SECONDS', 600)),
            'min_quality_score': float(os.getenv('MIN_QUALITY_SCORE', 6.0))
        }
        
        try:
            self.db_conn = psycopg2.connect(
                host=self.db_config['host'],
                port=self.db_config['port'],
                database=self.db_config['name'],
                user=self.db_config['user'],
                password=self.db_config['password']
            )
            logging.info("Connected to database")
        except Exception as e:
            logging.error(f"Database connection failed: {e}")
            sys.exit(1)
        
    def generate_post_batch(self):
        """Generate a batch of posts."""
        batch_size = self.generator_config['batch_size']
        logging.info(f"Generating batch of {batch_size} posts using DeepSeek API...")
        
        generated = 0
        for _ in range(batch_size):
            try:
                article = self.select_interesting_article()
                if article:
                    logging.info(f"Creating post for article: {article['title']}")
                    post = self.create_engaging_post(article)
                    if post and post.get('quality_score', 0) > self.generator_config['min_quality_score']:
                        post_id = self.save_post(post)
                        logging.info(f"Saved post with ID: {post_id}")
                        self.generate_ai_comments(post_id, num_comments=random.randint(3, 12))
                        generated += 1
                    else:
                        logging.info(f"Post quality score too low: {post.get('quality_score', 0) if post else 'None'}")
            except Exception as e:
                logging.error(f"Error generating post: {e}")
        
        logging.info(f"Generated {generated} posts in this batch")
        return generated
    
    def select_interesting_article(self):
        """Smart article selection strategy."""
        cursor = self.db_conn.cursor()
        
        strategy = random.choice(['fresh', 'quality', 'underused'])
        
        try:
            if strategy == 'fresh':
                cursor.execute("""
                    SELECT * FROM wiki_articles 
                    WHERE last_processed IS NULL 
                    ORDER BY RANDOM() LIMIT 1
                """)
            elif strategy == 'quality':
                cursor.execute("""
                    SELECT * FROM wiki_articles 
                    WHERE quality_score > 7.0 AND times_used < 3
                    ORDER BY RANDOM() LIMIT 1
                """)
            else:
                cursor.execute("""
                    SELECT * FROM wiki_articles 
                    WHERE times_used < 2 AND quality_score > 5.0
                    ORDER BY RANDOM() LIMIT 1
                """)
            
            row = cursor.fetchone()
            if row:
                # Convert row to dict
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
        except Exception as e:
            logging.error(f"Error selecting article: {e}")
        
        return None
    
    def create_engaging_post(self, article):
        """Use DeepSeek API to create an engaging social media post from Wikipedia content."""
        
        system_prompt = "You are a social media content creator for a Wikipedia-based platform. Your job is to take Wikipedia content and make it FASCINATING."
        
        user_prompt = f"""Wikipedia Article: {article['title']}
Content: {article['content'][:3000]}

Extract up to 3 relevant image URLs from the article content if available.

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
    "images": ["url1", "url2"],
    "quality_score": 7.5,
    "tldr": "One sentence that captures why this is cool"
}}

Make it punchy, make it interesting, make people want to read it. Think r/todayilearned quality."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=1500
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Try to extract JSON from the response
            # Sometimes AI adds markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            post_data = json.loads(response_text)
            
            # Add metadata
            post_data['source_article_id'] = article['id']
            post_data['wiki_url'] = article.get('url', f"https://en.wikipedia.org/wiki/{article['title']}")
            
            # Parse images from article
            if 'images' in article and article['images']:
                post_data['images'] = article['images']
            else:
                post_data['images'] = []
            
            return post_data
        except Exception as e:
            logging.error(f"Error creating post with AI: {e}")
            return None
    
    def save_post(self, post):
        """Save generated post to database."""
        cursor = self.db_conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO posts (title, content, category, tags, images, quality_score, 
                                 source_article_id, wiki_url, tldr, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            """, (
                post['title'],
                post['content'],
                post['category'],
                post.get('tags', []),
                post.get('images', []),
                post['quality_score'],
                post['source_article_id'],
                post['wiki_url'],
                post['tldr']
            ))
            
            post_id = cursor.fetchone()[0]
            self.db_conn.commit()
            
            # Update article metadata
            cursor.execute("""
                UPDATE wiki_articles 
                SET last_processed = NOW(), times_used = times_used + 1
                WHERE id = %s
            """, (post['source_article_id'],))
            self.db_conn.commit()
            
            return post_id
        except Exception as e:
            logging.error(f"Error saving post: {e}")
            self.db_conn.rollback()
            return None
    
    def generate_ai_comments(self, post_id, num_comments=5):
        """Generate AI persona comments for the post."""
        cursor = self.db_conn.cursor()
        cursor.execute("SELECT title, content FROM posts WHERE id = %s", (post_id,))
        post = cursor.fetchone()
        
        if not post:
            return
        
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
            try:
                comment = self.generate_single_comment(post, persona)
                if comment:
                    cursor.execute("""
                        INSERT INTO comments (post_id, username, content, is_ai, created_at)
                        VALUES (%s, %s, %s, true, NOW())
                    """, (post_id, persona['name'], comment))
            
            except Exception as e:
                logging.error(f"Error generating comment: {e}")
        
        self.db_conn.commit()
    
    def generate_single_comment(self, post, persona):
        """Generate a single AI comment in a specific persona."""
        system_prompt = f"You are {persona['name']}, a commenter on a Wikipedia social feed. Your style: {persona['style']}"
        
        user_prompt = f"""Post title: {post[0]}
Post content: {post[1][:500]}

Write a comment (2-4 sentences) responding to this post. Stay in character.
Be conversational, natural, like a real Reddit comment. No hashtags. No emojis (maybe 1 max).
Just respond with the comment text, nothing else."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.9,
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Error generating comment: {e}")
            return None


def main():
    """Main execution loop."""
    generator = WikiPostGenerator()
    
    while True:
        try:
            print(f"[{datetime.now()}] Generating post batch...")
            generator.generate_post_batch()
            
            delay = generator.generator_config['batch_delay_seconds']
            print(f"Waiting {delay} seconds until next batch...")
            time.sleep(delay)
        
        except KeyboardInterrupt:
            logging.info("Generator stopped by user")
            break
        except Exception as e:
            logging.error(f"Fatal error: {e}")
            time.sleep(60)  # Wait before retrying


if __name__ == "__main__":
    main()

