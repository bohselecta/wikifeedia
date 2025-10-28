#!/usr/bin/env python3
"""
Import Wikipedia articles from extracted JSON to PostgreSQL database.
Extracts articles with images for the Wikifeedia content generator.
"""

import json
import psycopg2
import os
import sys
import argparse
import re
from pathlib import Path

def extract_image_urls(text):
    """Extract image URLs from Wikipedia article text."""
    images = []
    
    # Match [[File:filename.jpg|size|description]] patterns
    pattern = r'\[\[File:([^\]]+)\]\]'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    for match in matches:
        # Extract filename (before any |)
        filename = match.split('|')[0].strip()
        
        # Convert to Wikimedia Commons URL
        # Example: "Octopus_in_natural_habitat.jpg" becomes
        # "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Octopus_in_natural_habitat.jpg/800px-..."
        
        # For simplicity, return the filename and let the frontend/API handle URL construction
        # or we can construct the full URL here
        if filename and not filename.startswith('http'):
            images.append(filename)
    
    # Limit to first 3 images per article
    return images[:3]

def get_wiki_url(title):
    """Convert article title to Wikipedia URL."""
    title_escaped = title.replace(' ', '_')
    return f"https://en.wikipedia.org/wiki/{title_escaped}"

def import_articles(source_dir, config_path='config.json'):
    """Import Wikipedia articles from extracted JSON files."""
    
    # Load config
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    db_config = config['database']
    
    # Connect to database
    conn = psycopg2.connect(
        host=db_config['host'],
        port=db_config['port'],
        database=db_config['name'],
        user=db_config['user'],
        password=db_config['password']
    )
    cursor = conn.cursor()
    
    # Count files to process
    json_files = list(Path(source_dir).rglob('*wiki_*'))
    total_files = len(json_files)
    print(f"Found {total_files} JSON files to process...")
    
    imported = 0
    skipped = 0
    
    for i, json_file in enumerate(json_files):
        if i % 100 == 0:
            print(f"Processing {i}/{total_files} files... ({imported} imported, {skipped} skipped)")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                for line in f:
                    article = json.loads(line)
                    
                    title = article.get('title', '')
                    text = article.get('text', '')
                    url = get_wiki_url(title)
                    
                    # Skip disambiguation pages and special pages
                    if 'disambiguation' in title.lower() or title.startswith('Template:'):
                        skipped += 1
                        continue
                    
                    # Skip if article is too short
                    if len(text) < 500:
                        skipped += 1
                        continue
                    
                    # Extract images
                    images = extract_image_urls(text)
                    
                    # Extract categories (if available in the article)
                    categories = []
                    
                    try:
                        cursor.execute("""
                            INSERT INTO wiki_articles (title, content, url, categories, images, quality_score)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT DO NOTHING
                        """, (title, text, url, categories, images, 0.0))
                        
                        imported += 1
                        
                        # Commit every 100 articles
                        if imported % 100 == 0:
                            conn.commit()
                    
                    except Exception as e:
                        print(f"Error inserting article '{title}': {e}")
                        continue
        
        except Exception as e:
            print(f"Error processing file {json_file}: {e}")
            continue
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n✅ Import complete!")
    print(f"   Imported: {imported} articles")
    print(f"   Skipped: {skipped} articles")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import Wikipedia articles to database')
    parser.add_argument('--source-dir', default='data/extracted_wiki',
                       help='Directory containing extracted Wikipedia JSON files')
    parser.add_argument('--config', default='config.json',
                       help='Path to config file')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.source_dir):
        print(f"Error: Directory '{args.source_dir}' not found")
        print("Make sure you've extracted the Wikipedia dump first.")
        sys.exit(1)
    
    import_articles(args.source_dir, args.config)

