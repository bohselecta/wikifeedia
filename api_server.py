#!/usr/bin/env python3
"""
Simple Flask API server for manual post generation testing.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Initialize DeepSeek client
api_key = os.getenv('DEEPSEEK_API_KEY')
client = OpenAI(
    api_key=api_key,
    base_url="https://api.deepseek.com/v1"
)

# Sample articles for testing
test_articles = [
    {"title": "Octopus", "content": "Octopuses have three hearts and decentralized intelligence. Two-thirds of neurons are in their arms."},
    {"title": "Marie Curie", "content": "Marie Curie's notebooks remain radioactive after 100 years. She died from radiation exposure."},
    {"title": "Operation Acoustic Kitty", "content": "The CIA spent $20 million training cats to be spies. The project failed spectacularly."},
    {"title": "Longyearbyen", "content": "A Norwegian town where dying is illegal due to permafrost preserving ancient viruses."},
    {"title": "Roman Concrete", "content": "Ancient Roman concrete gets stronger over time. Modern concrete fails after 50 years."},
]

def generate_post(article):
    """Generate a post using DeepSeek API."""
    
    system_prompt = "You are a social media content creator for a Wikipedia-based platform. Your job is to take Wikipedia content and make it FASCINATING."
    
    user_prompt = f"""Wikipedia Article: {article['title']}
Content: {article['content']}

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
    "quality_score": 7.5,
    "tldr": "One sentence that captures why this is cool"
}}

Make it punchy, make it interesting, make people want to read it. Think r/todayilearned quality."""

    try:
        response = client.chat.completions.create(
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
        
        post_data = json.loads(response_text)
        post_data['source_title'] = article['title']
        post_data['image'] = None  # Would be populated from actual article images
        
        return post_data
        
    except Exception as e:
        print(f"Error generating post: {e}")
        return None

@app.route('/api/generate', methods=['POST'])
def generate_posts():
    """Generate posts manually."""
    data = request.get_json()
    count = data.get('count', 1)
    
    posts = []
    for _ in range(min(count, len(test_articles))):
        article = test_articles[len(posts)]
        post = generate_post(article)
        if post:
            posts.append(post)
    
    return jsonify({
        'success': True,
        'posts': posts,
        'count': len(posts)
    })

@app.route('/')
def index():
    return send_from_directory('.', 'control.html')

if __name__ == '__main__':
    print("🎛️  Wikifeedia Control Panel starting...")
    print("    Visit: http://localhost:5000")
    print("    API endpoint: /api/generate")
    app.run(debug=True, port=5000)

