#!/usr/bin/env python3
"""
Quick test script to generate 5 Wikifeedia posts using DeepSeek API.
This doesn't require database setup - just tests the AI generation.
"""

import os
from openai import OpenAI
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv('DEEPSEEK_API_KEY')
if not api_key:
    print("❌ Error: DEEPSEEK_API_KEY not found in .env file")
    print("   Make sure you've copied .env.example to .env and added your key")
    exit(1)

# Initialize DeepSeek client
client = OpenAI(
    api_key=api_key,
    base_url="https://api.deepseek.com/v1"
)

print(f"✅ Connected to DeepSeek API")
print(f"   Model: deepseek-v3.2-exp")
print(f"   Generating 5 test posts...\n")

# Sample Wikipedia articles (for testing)
test_articles = [
    {
        "title": "Octopus",
        "content": "Octopuses have three hearts, blue blood, and can edit their own RNA. They are considered the most intelligent invertebrates. Unlike most animals, octopuses have a decentralized nervous system with two-thirds of neurons located in their arms. Scientists have observed them using tools, solving puzzles, and expressing distinct personalities. They can change color and texture in milliseconds to blend with their environment.",
        "category": "Nature",
        "images": ["Octopus_in_natural_habitat.jpg"]
    },
    {
        "title": "Marie Curie",
        "content": "Marie Curie was the first woman to win a Nobel Prize and the only person to win in two different sciences (Physics and Chemistry). Her research on radioactivity was groundbreaking but ultimately fatal. Her notebooks remain so radioactive they're stored in lead-lined boxes. She died from aplastic anemia caused by radiation exposure, as she and her contemporaries didn't understand the dangers.",
        "category": "Biography",
        "images": ["Marie_Curie-c1920.jpg"]
    },
    {
        "title": "Operation Acoustic Kitty",
        "content": "In the 1960s, the CIA spent $20 million on 'Operation Acoustic Kitty' - an attempt to turn cats into mobile surveillance devices. The plan involved surgically implanting listening devices and radio transmitters into cats, then releasing them near targets. The project failed spectacularly when the first test cat immediately wandered away and was hit by a taxi. The CIA concluded cats were 'too independent and uncontrollable' to be good operatives.",
        "category": "Mystery",
        "images": ["Cat_August_2010-4.jpg"]
    },
    {
        "title": "Longyearbyen",
        "content": "Longyearbyen, Norway, is a town where dying has been illegal since 1950. The ground is permanently frozen (permafrost), so bodies don't decompose. A 1918 flu epidemic left corpses still perfectly preserved in ice, complete with intact viruses. Scientists discovered live samples of the 1918 influenza virus in the permafrost. Terminally ill residents must leave before death to prevent reintroducing ancient diseases.",
        "category": "Geography",
        "images": ["Longyearbyen_2007-07.jpg"]
    },
    {
        "title": "Roman Concrete",
        "content": "Roman concrete gets stronger over time, while modern concrete weakens after 50 years. The Pantheon's unreinforced concrete dome, built in 126 AD, shows no structural problems 2,000 years later. Roman engineers added volcanic ash (pozzolana) to their concrete. When seawater seeped into Roman harbor structures, chemical reactions made the concrete stronger over centuries. Scientists are now reverse-engineering Roman concrete for modern construction.",
        "category": "History",
        "images": ["Pantheon_Rome_Italy.jpg"]
    }
]

def generate_post(article):
    """Generate an engaging post from a Wikipedia article."""
    
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
    "category": "{article['category']}",
    "tags": ["tag1", "tag2", "tag3"],
    "quality_score": 7.5,
    "tldr": "One sentence that captures why this is cool"
}}

Make it punchy, make it interesting, make people want to read it. Think r/todayilearned quality."""

    try:
        print(f"🔄 Generating post from: {article['title']}...")
        
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
        
        # Parse JSON (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        post_data = json.loads(response_text)
        
        # Add article info
        post_data['source_title'] = article['title']
        post_data['images'] = article.get('images', [])
        
        print(f"✅ Generated: {post_data['title']}")
        print(f"   Category: {post_data['category']}")
        print(f"   Quality Score: {post_data['quality_score']}\n")
        
        return post_data
    
    except Exception as e:
        print(f"❌ Error generating post: {e}\n")
        return None

def main():
    """Generate 5 test posts."""
    
    print("=" * 70)
    print("🧪 Wikifeedia Content Generator - Test Mode")
    print("=" * 70)
    print()
    
    generated_posts = []
    
    for i, article in enumerate(test_articles, 1):
        print(f"[{i}/5] Processing {article['title']}...")
        post = generate_post(article)
        if post:
            generated_posts.append(post)
        print("-" * 70)
    
    print("\n" + "=" * 70)
    print("✅ Test Complete!")
    print("=" * 70)
    print(f"\nGenerated {len(generated_posts)} posts successfully\n")
    
    # Show summary
    for i, post in enumerate(generated_posts, 1):
        print(f"\n📝 Post #{i}:")
        print(f"   Title: {post['title']}")
        print(f"   Category: {post['category']}")
        print(f"   Quality: {post['quality_score']}/10")
        print(f"   Content Preview: {post['content'][:100]}...")
    
    # Save to file
    output_file = "test_posts.json"
    with open(output_file, 'w') as f:
        json.dump(generated_posts, f, indent=2)
    
    print(f"\n💾 Saved to {output_file}")

if __name__ == "__main__":
    main()

