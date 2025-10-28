# Database Setup - Quick Guide

## ✅ Your Supabase is Connected

You're using project: `mshebskfvtoyfmrrvhpx`

## Step 1: Create the Database Tables

1. **Go to Supabase SQL Editor**
   - Visit: https://supabase.com/dashboard/project/mshebskfvtoyfmrrvhpx/editor

2. **Create a new SQL query**
   - Click "New query" or use existing SQL editor

3. **Paste the schema**
   - Open `lib/database/schema.sql` 
   - Copy the entire contents
   - Paste into Supabase SQL editor

4. **Run it**
   - Click "Run" button
   - You should see "Success" message

## Step 2: Generate Posts

Once tables are created, run:

```bash
python3 scripts/generate_initial_content.py
```

This will:
- Clear any old posts
- Generate 10 unique posts
- Add AI bot comments to each
- Save to your Supabase database

## What's in the Schema?

The schema creates these tables:
- ✅ `posts` - The main content
- ✅ `comments` - User and AI comments
- ✅ `post_votes` - User upvotes
- ✅ `comment_votes` - Comment upvotes
- ✅ `bookmarks` - Saved posts
- ✅ `user_profiles` - User data
- ✅ Row Level Security policies

## Quick Copy Commands

Just want to copy the SQL? Use:

```bash
cat lib/database/schema.sql | pbcopy
```

Then paste into Supabase SQL editor.

---

**After setup, run:** `python3 scripts/generate_initial_content.py`

EOF
cat SETUP_DATABASE.md

