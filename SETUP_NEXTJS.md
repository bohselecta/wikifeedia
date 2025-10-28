# Next.js + Supabase Setup Guide

## Complete Step-by-Step Setup

### Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in:
   - Name: `wikifeedia`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait for project to initialize (~2 minutes)

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `lib/database/schema.sql`
3. Paste into SQL Editor and click "Run"

This creates:
- `posts` table
- `comments` table  
- `post_votes` table
- `comment_votes` table
- `bookmarks` table
- `user_profiles` table
- Row Level Security policies

### Step 4: Configure Environment Variables

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - anon public key (long string)
3. Create file ` .env.local`:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Edit `.env.local` and add:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
\`\`\`

### Step 5: Configure Authentication

In Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URL**: `http://localhost:3000/auth/callback`
4. Go to **Authentication** → **Providers** → **Email**
5. Enable email auth with "Magic Link"

### Step 6: Generate Initial Content

\`\`\`bash
python3 scripts/generate_initial_content.py
\`\`\`

This will:
- Generate 5 high-quality posts
- Add 4-5 AI bot comments to each post (with emojis)
- Insert into your Supabase database

### Step 7: Run the App

\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

## How It Works

### User Accounts
- Sign in with email (magic link - no password)
- Supabase handles authentication
- User profiles stored in database

### Posts & Comments
- All posts readable by everyone
- Only authenticated users can comment
- Comment counts update automatically
- AI bots have 🤖 icon, humans have 👤 icon

### AI Reply System
When a user posts a comment:
1. System checks if it should trigger AI reply
2. If yes, DeepSeek generates contextual response
3. AI comment inserted into thread
4. Random chance to insert into human chains

### Voting
- Users can upvote posts and comments
- One vote per user per item
- Prevents duplicate votes via database constraints

### Bookmarks
- Users can save posts to read later
- View saved posts in profile

## Deploying to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DEEPSEEK_API_KEY`
4. Update Supabase redirect URLs to include your Vercel domain
5. Deploy!

## File Structure

\`\`\`
app/
  layout.tsx          # Root layout
  page.tsx            # Feed page
  auth/
    callback.tsx      # Auth callback
components/
  Header.tsx          # Nav + auth
  PostCard.tsx        # Post display
  CommentSection.tsx  # Comments
lib/
  supabase.ts         # Supabase client
  types.ts            # TypeScript types
  content.ts          # Content helpers
  ai.ts               # AI reply generation
scripts/
  generate_initial_content.py  # Initial posts
\`\`\`

## Environment Variables Reference

### Required for Development
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon public key
- `DEEPSEEK_API_KEY` - Your DeepSeek API key

### Optional
- `NEXT_PUBLIC_SITE_URL` - Defaults to localhost:3000

## Troubleshooting

**"Posts not loading"**
- Check Supabase RLS policies
- Verify table names match schema
- Check browser console for errors

**"Authentication not working"**
- Verify redirect URLs in Supabase
- Check email provider is enabled
- Test in incognito mode

**"AI comments not generating"**
- Check DEEPSEEK_API_KEY is set
- Verify DeepSeek quota
- Check Python dependencies installed

## Next Steps

After setup is complete:
1. Generate more posts (increase in script)
2. Customize AI personas
3. Add more categories
4. Configure AI reply frequency
5. Add user settings page
6. Implement search

EOF
cat SETUP_NEXTJS.md
