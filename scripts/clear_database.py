#!/usr/bin/env python3
"""Clear all posts from the database."""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    print("❌ Missing Supabase credentials")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

print("🧹 Deleting all posts and comments...")

try:
    # Delete comments first (foreign key constraint)
    result = supabase.table('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print(f"✅ Deleted {len(result.data) if result.data else 0} comments")
    
    # Delete posts
    result = supabase.table('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print(f"✅ Deleted {len(result.data) if result.data else 0} posts")
    
    print("\n✨ Database cleared!")
    print("   Now generate fresh posts with: python3 scripts/generate_from_real_wiki.py")
    
except Exception as e:
    print(f"❌ Error: {e}")

