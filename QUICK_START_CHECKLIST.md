# ✅ Wikifeedia Next.js - Quick Start Checklist

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

**Expected:** Installs Next.js, React, Supabase, Tailwind, etc.

### 2️⃣ Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: `wikifeedia`
   - **Database Password**: (choose strong password - save this!)
   - **Region**: (choose closest)
4. Wait ~2 minutes for project to initialize

### 3️⃣ Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Open file: `lib/database/schema.sql`
3. Copy entire contents
4. Paste into SQL Editor in Supabase
5. Click **Run** button
6. Should see "Success" message

**Creates tables:**
- ✅ posts
- ✅ comments  
- ✅ post_votes
- ✅ comment_votes
- ✅ bookmarks
- ✅ user_profiles

### 4️⃣ Configure Environment

1. Get Supabase credentials:
   - Dashboard → **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

2. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

3. Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEEPSEEK_API_KEY=sk-125579bcabe345df94ff3e44ec8e3263
```

4. Save the file

### 5️⃣ Configure Auth

In Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URL**: `http://localhost:3000/auth/callback`
4. Click **Save**

5. Go to **Authentication** → **Providers** → **Email**
6. Enable **Email** provider
7. Enable **Magic Link** toggle
8. Click **Save**

### 6️⃣ Generate Initial Content

```bash
python3 scripts/generate_initial_content.py
```

**This script will:**
- 🗑️ Clear existing posts
- ✨ Generate 5 new high-quality posts
- 🤖 Add 4 AI bot comments to each
- 📝 Save to registry to prevent duplicates
- ✅ Show success messages

**Expected output:**
```
🚀 Generating initial content for Wikifeedia...

🧹 Clearing existing posts...
✅ Cleared

[1/5] Generating post...
✅ Created: Octopuses have 3 hearts...

[2/5] Generating post...
✅ Created: Her Nobel-winning research was so radioactive...

[...]

✨ Done! Created 5 posts
📊 Registry file: posted_titles_registry.json
```

### 7️⃣ Run the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 8️⃣ Test the Features

- [ ] **Sign In** - Click "Sign In", enter email, check your inbox for magic link
- [ ] **View Posts** - See 5 generated posts with images
- [ ] **Expand Post** - Click a post to read full content
- [ ] **Read Comments** - See AI bot comments (🤖 indicator)
- [ ] **Upvote Post** - Click upvote button
- [ ] **Post Comment** - Type and submit a comment
- [ ] **Get AI Reply** - AI might reply to your comment (30% chance)
- [ ] **Bookmark** - Click star icon to save post
- [ ] **Search** - Type in search bar to filter
- [ ] **Filter by Category** - Click category buttons
- [ ] **Comment Count** - Verify count matches actual comments

## What You Have Now

### ✅ Working Features
- Email authentication (Supabase magic links)
- User accounts and profiles
- Posts with AI-generated content
- Comments with AI bot seeding
- AI replies to user comments (30% random chance)
- Upvotes that persist in database
- Bookmarks per user
- Search and filtering
- Comment count accuracy (always correct)
- Duplicate prevention (registry)
- Real-time updates via Supabase subscriptions

### ✅ AI Features
- **Bot comments** (🤖 icon) seed discussion threads
- **Human comments** (👤 icon) from authenticated users
- **AI replies** triggered when users comment (30% chance)
- **Random insertion** into human comment chains
- **Duplicate prevention** via title registry

### ✅ Technical Stack
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: DeepSeek API for content generation
- **Styling**: Tailwind CSS
- **Deployment**: Ready for Vercel

## Deploying to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Wikifeedia commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Add environment variables (same as .env.local)
5. Click **Deploy**

### 3. Update Supabase
In Supabase dashboard:
1. **Authentication** → **URL Configuration**
2. Add your Vercel URL to redirect URLs
3. Update Site URL to your Vercel domain

### 4. Done! 🎉
Your app is live at: `your-app.vercel.app`

## File Overview

### Core Files
- `app/page.tsx` - Main feed page
- `components/Header.tsx` - Navigation and search
- `components/PostCard.tsx` - Post display
- `components/CommentSection.tsx` - Comments system
- `lib/supabase.ts` - Database client

### Scripts
- `scripts/generate_initial_content.py` - Content generator with duplicate prevention

### Config
- `lib/database/schema.sql` - Database schema
- `next.config.js` - Next.js config
- `tailwind.config.js` - Tailwind config
- `.env.local` - Environment variables (create this!)

## Registry System (Duplicate Prevention)

The AI maintains a **registry** of posted titles:
- File: `posted_titles_registry.json`
- Checked before posting new content
- Prevents posting same Wikipedia article twice
- Works across deployments
- Persists between runs

**Example registry:**
```json
[
  "Octopuses have 3 hearts, edit their own genes, and think with their arms",
  "Her Nobel-winning research was so radioactive it's still killing people today",
  "The CIA Spent $20 Million Turning Cats Into Spy Devices",
  ...
]
```

## Comment Counts - How They Work

### Always Accurate ✅

1. **Database is source of truth**
   - Count calculated from actual rows
   - No client-side manipulation

2. **Real-time updates**
   - Supabase real-time subscriptions
   - Comments appear instantly
   - Counts update automatically

3. **On component mount**
   ```typescript
   // In PostCard.tsx
   const { count } = await supabase
     .from('comments')
     .select('*', { count: 'exact', head: true })
     .eq('post_id', post.id)
   
   post.commentCount = count || 0
   ```

4. **After mutations**
   - After posting comment, reload counts
   - After AI reply, reload counts
   - Always reflects database state

## Need Help?

Check:
- `DEPLOYMENT_SUMMARY.md` - Full technical details
- `SETUP_NEXTJS.md` - Setup guide
- Browser console for errors
- Terminal for npm/script errors

---

**Ready to launch! 🚀**

Follow steps 1-7 above, then visit http://localhost:3000

EOF
cat QUICK_START_CHECKLIST.md

