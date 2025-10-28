#!/usr/bin/env python3
"""
Generate initial content for Wikifeedia.

⚠️ NOTE: This script uses hardcoded sample articles.
For UNIQUE posts from the actual Wikipedia dump, use:
    python3 scripts/generate_from_real_wiki.py

Creates 10 posts with AI bot comments.
Also maintains a registry to prevent duplicates.
"""

import os
import json
import sys
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
    print("   Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and DEEPSEEK_API_KEY")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)
ai_client = OpenAI(api_key=deepseek_key, base_url="https://api.deepseek.com/v1")

# Registry file to prevent duplicates
REGISTRY_FILE = 'posted_titles_registry.json'

def load_registry():
    """Load the registry of already-posted titles."""
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, 'r') as f:
            return set(json.load(f))
    return set()

def save_to_registry(title):
    """Add title to registry."""
    registry = load_registry()
    registry.add(title)
    with open(REGISTRY_FILE, 'w') as f:
        json.dump(list(registry), f)

def check_if_posted(title):
    """Check if a title has already been posted."""
    # Check registry file
    registry = load_registry()
    if title in registry:
        return True
    
    # Also check database
    result = supabase.table('posts').select('title').eq('title', title).execute()
    return len(result.data) > 0

def generate_post(article):
    """Generate a post using DeepSeek API."""
    
    system_prompt = "You are a social media content creator for a Wikipedia-based platform. Your job is to take Wikipedia content and make it FASCINATING."
    
    user_prompt = f"""Wikipedia Article: {article['title']}
Content: {article['content']}

Create a social media post with:
1. A HOOK TITLE (10-15 words max) that makes people NEED to click
2. The most interesting 2-3 facts/stories from this article
3. A category tag (e.g., History, Science, Technology, Nature, Culture)
4. A "why this matters" or "mind-blowing connection" angle

Format your response as JSON:
{{
    "title": "The hook title here",
    "content": "The engaging content here (2-4 paragraphs, conversational tone)",
    "category": "Category name",
    "tags": ["tag1", "tag2", "tag3"],
    "quality_score": 7.5,
    "tldr": "One sentence that captures why this is cool"
}}

Make it punchy, make it interesting, make people want to read it. Think r/todayilearned quality."""

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
        
        response_text = response.choices[0].message.content.strip()
        
        # Parse JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        print(f"Error generating post: {e}")
        return None

def generate_bot_comments(post_title, post_content, count=4):
    """Generate AI bot comments to seed discussion."""
    comments = []
    personas = [
        {"name": "ScienceNerd_", "style": "skeptical scientist, asks good questions"},
        {"name": "HistoryBuff1987", "style": "enthusiastic historian, loves to add context"},
        {"name": "CasualLurker", "style": "casual reader, reacts with 'wow' and simple thoughts"},
        {"name": "FunFactBot", "style": "adds related fun facts and connections"},
    ]
    
    for persona in personas[:count]:
        system_prompt = f"You are {persona['name']}, a commenter on Wikifeedia. Your style: {persona['style']}"
        
        user_prompt = f"""Post: "{post_title}"

{post_content[:500]}

Write a short comment (2-3 sentences) responding to this post. Stay in character. Be conversational. No hashtags."""

        try:
            response = ai_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.9,
                max_tokens=150
            )
            
            content = response.choices[0].message.content.strip()
            
            comments.append({
                "username": persona['name'],
                "content": content,
                "is_ai": True,
                "upvotes": 0
            })
            
        except Exception as e:
            print(f"Error generating comment: {e}")
    
    return comments

def create_post():
    """Create a single post with AI comments."""
    
    # Sample articles
    sample_articles = [
        {
            "title": "Octopus",
            "content": "Octopuses have three hearts, blue blood, and can edit their own RNA. They are the most intelligent invertebrates. Unlike most animals, octopuses have a decentralized nervous system with two-thirds of neurons located in their arms. Scientists have observed them using tools, solving puzzles, and expressing distinct personalities.",
        },
        {
            "title": "Marie Curie",
            "content": "Marie Curie was the first woman to win a Nobel Prize and the only person to win in two different sciences. Her research on radioactivity was groundbreaking but ultimately fatal. Her notebooks remain so radioactive they're stored in lead-lined boxes. She died from aplastic anemia caused by radiation exposure.",
        },
        {
            "title": "Operation Acoustic Kitty",
            "content": "In the 1960s, the CIA spent $20 million on 'Operation Acoustic Kitty' - an attempt to turn cats into mobile surveillance devices. The plan involved surgically implanting listening devices into cats. The project failed when the first test cat immediately wandered away and was hit by a taxi.",
        },
        {
            "title": "Longyearbyen",
            "content": "Longyearbyen, Norway, is a town where dying has been illegal since 1950. The ground is permanently frozen (permafrost), so bodies don't decompose. A 1918 flu epidemic left corpses still perfectly preserved in ice, complete with intact viruses. Terminally ill residents must leave before death.",
        },
        {
            "title": "Roman Concrete",
            "content": "Roman concrete gets stronger over time, while modern concrete weakens after 50 years. The Pantheon's unreinforced concrete dome, built in 126 AD, shows no structural problems 2,000 years later. Roman engineers added volcanic ash to their concrete. Scientists are now reverse-engineering this technology.",
        },
    ]
    
    import random
    article = random.choice(sample_articles)
    
    # Check if already posted
    post = generate_post(article)
    if not post:
        return None
        
    if check_if_posted(post['title']):
        print(f"⏭️  Skipping duplicate: {post['title']}")
        return None
    
    # Insert post
    post_result = supabase.table('posts').insert({
        'title': post['title'],
        'content': post['content'],
        'category': post['category'],
        'tags': post.get('tags', []),
        'images': [],
        'tldr': post['tldr'],
        'upvotes': 0,
        'views': 0
    }).execute()
    
    if not post_result.data or len(post_result.data) == 0:
        print(f"❌ Failed to insert post")
        return None
    
    post_id = post_result.data[0]['id']
    
    # Generate bot comments
    bot_comments = generate_bot_comments(post['title'], post['content'], count=4)
    
    # Insert comments
    for comment in bot_comments:
        supabase.table('comments').insert({
            'post_id': post_id,
            'username': comment['username'],
            'content': comment['content'],
            'is_ai': True,
            'upvotes': comment['upvotes']
        }).execute()
    
    # Save to registry
    save_to_registry(post['title'])
    
    print(f"✅ Created: {post['title']} (with {len(bot_comments)} AI comments)")
    
    return post_result.data[0]

def main():
    print("🚀 Generating initial content for Wikifeedia...\n")
    
    # First, clear existing posts
    print("🧹 Clearing existing posts...")
    supabase.table('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    supabase.table('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print("✅ Cleared\n")
    
    # Generate 10 posts
    created = 0
    for i in range(10):
        print(f"[{i+1}/10] Generating post...")
        if create_post():
            created += 1
        print()
    
    print(f"✨ Done! Created {created} posts")
    print(f"📊 Registry file: {REGISTRY_FILE}")

if __name__ == '__main__':
    main()

