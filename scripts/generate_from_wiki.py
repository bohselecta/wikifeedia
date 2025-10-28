#!/usr/bin/env python3
"""
Generate posts from the actual Wikipedia dump.
This script reads from the Wikipedia XML files and creates posts from interesting articles.
"""

import bz2
import re
import xml.etree.ElementTree as ET
import random
import json
import os
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
deepseek_key = os.getenv('DEEPSEEK_API_KEY')

if not supabase_url or not supabase_key or not deepseek_key:
    print("❌ Error: Missing environment variables")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)
ai_client = OpenAI(api_key=deepseek_key, base_url="https://api.deepseek.com/v1")

def parse_wiki_dump(filepath):
    """Parse Wikipedia XML dump and extract articles."""
    articles = []
    
    print(f"📖 Reading Wikipedia dump: {filepath}")
    
    # Check if file is compressed
    if filepath.endswith('.bz2'):
        f = bz2.open(filepath, 'rt')
    else:
        f = open(filepath, 'r')
    
    try:
        # Read in chunks (Wikipedia dumps can be huge)
        chunk = ""
        for line in f:
            # Look for <page> tags
            if '<page>' in line:
                chunk = line
                continue
            
            if chunk:
                chunk += line
            
            if '</page>' in line and chunk:
                try:
                    # Parse this page
                    page_root = ET.fromstring(chunk)
                    
                    # Extract title and text
                    title = page_root.find('.//title')
                    text = page_root.find('.//text')
                    
                    if title is not None and text is not None:
                        title_text = title.text or ""
                        text_content = text.text or ""
                        
                        # Filter for interesting articles (longer content, not stubs)
                        if len(text_content) > 500 and len(title_text) > 0:
                            # Skip disambiguation pages, etc.
                            if not any(word in title_text for word in ['List of', 'Category:', 'Template:', 'File:', 'Disambiguation']):
                                articles.append({
                                    'title': title_text,
                                    'content': text_content[:2000]  # First 2000 chars
                                })
                                print(f"   Found: {title_text}")
                except ET.ParseError:
                    pass
                
                chunk = ""
            
            # Limit to 500 interesting articles to avoid memory issues
            if len(articles) >= 500:
                break
    
    finally:
        f.close()
    
    print(f"✅ Extracted {len(articles)} articles")
    return articles

def generate_post_from_wiki(article_title, article_content):
    """Generate a post from Wikipedia article using AI."""
    
    system_prompt = "You are a social media content creator. Take this Wikipedia article and create an engaging post."
    
    user_prompt = f"""Wikipedia Article: {article_title}

Content: {article_content[:1000]}

Create a social media post with:
1. A HOOK TITLE (10-15 words max)
2. The most interesting facts (2-4 paragraphs)
3. Category tag
4. Tags (3-5)
5. TL;DR

Format as JSON:
{{
    "title": "hook title",
    "content": "content here",
    "category": "Science/Nature/History/etc",
    "tags": ["tag1", "tag2"],
    "tldr": "one sentence"
}}
"""
    
    try:
        response = ai_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=1500
        )
        
        content = response.choices[0].message.content.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error generating post: {e}")
        return None

def main():
    print("🚀 Generating posts from Wikipedia dump...\n")
    
    # Find Wikipedia dump files
    wiki_files = [f for f in os.listdir('.') if 'enwiki' in f and f.endswith('.bz2')]
    
    if not wiki_files:
        print("❌ No Wikipedia dump files found!")
        print("   Looking for: enwiki-*.bz2")
        return
    
    # Use the smaller index file first (if available)
    dump_file = [f for f in wiki_files if 'index' not in f][0]
    
    print(f"📚 Using: {dump_file}\n")
    
    # Parse articles
    articles = parse_wiki_dump(dump_file)
    
    if not articles:
        print("❌ No articles found!")
        return
    
    # Randomly select articles to turn into posts
    num_posts = 10
    selected = random.sample(articles, min(num_posts, len(articles)))
    
    print(f"\n🎲 Generating {len(selected)} posts...\n")
    
    # Generate posts
    created = 0
    for i, article in enumerate(selected):
        print(f"[{i+1}/{len(selected)}] Processing: {article['title']}")
        
        post = generate_post_from_wiki(article['title'], article['content'])
        
        if not post:
            print(f"   ❌ Failed")
            continue
        
        # Insert into database
        try:
            result = supabase.table('posts').insert({
                'title': post['title'],
                'content': post['content'],
                'category': post.get('category', 'Science'),
                'tags': post.get('tags', []),
                'images': [],
                'tldr': post.get('tldr', ''),
                'upvotes': 0,
                'views': 0
            }).execute()
            
            if result.data:
                print(f"   ✅ Created: {post['title']}")
                created += 1
        except Exception as e:
            print(f"   ❌ Database error: {e}")
        
        print()
    
    print(f"✨ Done! Created {created} posts")

if __name__ == '__main__':
    main()

