#!/usr/bin/env python3
"""
Generate posts from ACTUAL Wikipedia articles in the dump.
This reads from the real 24GB dump file.
"""

import bz2
import re
import random
import json
import os
import xml.etree.ElementTree as ET
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv
import sys

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

def extract_articles_from_dump(dump_file, max_articles=200):
    """Extract articles from Wikipedia dump."""
    articles = []
    current_title = None
    current_text = None
    in_text = False
    
    print(f"📖 Reading: {dump_file}")
    
    with bz2.open(dump_file, 'rt', encoding='utf-8', errors='ignore') as f:
        for line in f:
            # Extract title
            if '<title>' in line:
                match = re.search(r'<title>(.*?)</title>', line)
                if match:
                    current_title = match.group(1)
            
            # Extract text
            if '<text' in line and current_title:
                in_text = True
                current_text = ""
            
            if in_text:
                # Accumulate text until </text>
                if '</text>' in line:
                    # Process article
                    if current_title and current_text and len(current_text) > 300:
                        # Skip disambiguation and lists
                        skip_words = ['List of', 'Category:', 'Template:', 'File:', 'disambiguation']
                        if not any(word in current_title for word in skip_words):
                            # Extract first paragraph (before ==)
                            intro = re.split(r'==', current_text)[0].strip()[:800]
                            if len(intro) > 100:
                                articles.append({
                                    'title': current_title,
                                    'content': intro
                                })
                                if len(articles) % 10 == 0:
                                    print(f"   Found {len(articles)} articles...")
                    
                    in_text = False
                    current_title = None
                    current_text = None
                else:
                    current_text += line
            
            # Stop after enough articles
            if len(articles) >= max_articles:
                break
    
    print(f"✅ Extracted {len(articles)} articles\n")
    return articles

def generate_post_from_article(article_title, article_content):
    """Generate engaging post from Wikipedia article."""
    
    system_prompt = "You create fascinating social media posts from Wikipedia articles. Make them engaging and surprising."
    
    user_prompt = f"""Wikipedia Article: {article_title}

Content: {article_content}

Create an engaging social media post. Make it FASCINATING with surprising facts.

Return JSON only:
{{
    "title": "Hook title (10-15 words)",
    "content": "2-4 engaging paragraphs",
    "category": "History/Science/Nature/Technology",
    "tags": ["tag1", "tag2", "tag3"],
    "tldr": "One sentence summary"
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
        
        if "```" in content:
            content = content.split("```")[1].split("```")[0]
            if "json" in content:
                content = content.split("json")[1]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"   ❌ AI error: {e}")
        return None

def main():
    print("🚀 Generating posts from REAL Wikipedia articles...\n")
    
    # Check for dump file
    dump_file = 'enwiki-20251001-pages-articles-multistream.xml.bz2'
    
    if not os.path.exists(dump_file):
        print(f"❌ File not found: {dump_file}")
        print("   Make sure the Wikipedia dump is in the project root")
        return
    
    # Extract articles
    articles = extract_articles_from_dump(dump_file, max_articles=200)
    
    if len(articles) < 10:
        print("❌ Not enough articles found!")
        return
    
    # Randomly select 10 unique articles
    selected = random.sample(articles, 10)
    
    print(f"🎲 Creating 10 posts from Wikipedia articles...\n")
    
    created = 0
    for i, article in enumerate(selected):
        print(f"[{i+1}/10] {article['title']}")
        
        post = generate_post_from_article(article['title'], article['content'])
        
        if not post:
            print("   ❌ Failed to generate post")
            continue
        
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
    
    print(f"✨ Created {created} unique posts from Wikipedia!")

if __name__ == '__main__':
    main()

