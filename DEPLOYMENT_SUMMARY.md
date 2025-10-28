# 🚀 Wikifeedia Next.js Deployment - Complete Setup

## What's Built

### ✅ Complete Next.js 14 App
- **App Router** with Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** integration for backend

### ✅ Database (Supabase)
- **Posts** table with metadata
- **Comments** table with AI flag 🤖
- **Votes** tables (prevents duplicates)
- **Bookmarks** system
- **User profiles** with settings
- **Row Level Security** (RLS) policies

### ✅ Components Created
- `Header.tsx` - Navigation and search
- `AuthButton.tsx` - Email magic link authentication
- `PostCard.tsx` - Post display with interactions
- `CommentSection.tsx` - Comments with real-time updates

### ✅ Features Implemented
- ✉️ **Email auth** (Supabase magic links)
- 📝 **Comments** with AI bot seeding
- ⬆️ **Upvotes** that persist
- ⭐ **Bookmarks** per user
- 💬 **AI replies** to user comments (30% chance)
- 🔍 **Search** and filtering
- 📊 **Comment counts** update automatically
- 🤖 **Bot indicator** icons (AI vs human)
- 🚫 **Duplicate prevention** via registry

### ✅ Content Generator Script
- `scripts/generate_initial_content.py`
- Creates 5 posts with 4 AI bot comments each
- Maintains `posted_titles_registry.json` to prevent duplicates
- Clears old posts before creating new ones
- **Prevents posting same content twice**

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Set Up Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run `lib/database/schema.sql`
4. Copy URL and anon key to `.env.local`

### 3. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### 4. Generate Content
```bash
python3 scripts/generate_initial_content.py
```

This will:
- Clear existing posts
- Generate 5 high-quality posts
- Add 4 AI bot comments to each
- Save to registry to prevent duplicates

### 5. Run
```bash
npm run dev
```

Visit: http://localhost:3000

## How AI Reply System Works

### Bot Comment Seeding
When content is generated, 4 AI bots comment immediately:
- 🤖 ScienceNerd_ - Skeptical scientist
- 🤖 HistoryBuff1987 - Enthusiastic historian  
- 🤖 CasualLurker - Casual reactions
- 🤖 FunFactBot - Adds fun facts

### User Comment Replies
When a user posts a comment:
1. System checks random chance (30%)
2. If triggered, sends to `/api/ai-reply`
3. DeepSeek generates contextual reply
4. AI comment inserted with 🤖 icon
5. User sees instant response

### Smart Threading
- AI bots randomly insert into human comment chains
- Keeps discussion flowing
- Adds amusement factor

## Database Schema

```sql
posts (id, title, content, category, tags, images, upvotes, views, created_at)
  ↓
comments (id, post_id, user_id, username, content, is_ai, upvotes, created_at)
  ↓
post_votes (post_id, user_id) -- prevents duplicate votes
  ↓
comment_votes (comment_id, user_id)
  ↓
bookmarks (post_id, user_id)
```

## Comment Count Accuracy

**Always accurate because:**
1. Database has single source of truth
2. React hooks reload data after mutations
3. Supabase real-time subscriptions
4. No client-side state manipulation

```typescript
// In PostCard.tsx
const { count } = await supabase
  .from('comments')
  .select('*', { count: 'exact', head: true })
  .eq('post_id', post.id)
```

## Deployment to Vercel

### Prerequisites
- GitHub repo with code
- Supabase project configured
- Vercel account

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `DEEPSEEK_API_KEY`

3. **Update Supabase Auth URLs**
- In Supabase dashboard
- Auth → URL Configuration
- Add your Vercel domain to redirect URLs

4. **Deploy**
- Click Deploy in Vercel
- Wait for build to complete
- Your app is live! 🎉

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
```

### Production (Vercel)
- Add same variables in Vercel dashboard
- Under Project Settings → Environment Variables

## AI Reply API

Endpoint: `/api/ai-reply`
Method: POST
Body:
```json
{
  "title": "Post title",
  "userComment": "User's comment text",
  "postId": "uuid",
  "username": "john_doe"
}
```

Response:
```json
{
  "reply": "AI-generated response"
}
```

## File Structure

```
app/
  layout.tsx              # Root layout
  page.tsx                # Feed page
  globals.css             # Global styles
  auth/
    callback/
      route.ts            # Auth callback handler
  api/
    ai-reply/
      route.ts            # AI reply endpoint
components/
  Header.tsx              # Nav + search + filters
  AuthButton.tsx          # Login/logout UI
  PostCard.tsx            # Post display + actions
  CommentSection.tsx      # Comments + add comment
lib/
  supabase.ts             # Supabase client
  types.ts                # TypeScript definitions
  database/
    schema.sql            # Database schema
scripts/
  generate_initial_content.py  # Content generator
```

## Key Features

### Duplicate Prevention ✅
- Registry file tracks posted titles
- Database check before posting
- Never posts same content twice
- Works across deployments

### Real-time Updates ✅
- Supabase real-time subscriptions
- Comments update instantly
- No page refresh needed

### User Experience ✅
- Email magic links (no password)
- Persistent upvotes and bookmarks
- AI indicators (🤖 vs 👤)
- Smooth animations
- Responsive design

## Testing Checklist

- [ ] Install dependencies
- [ ] Run database schema
- [ ] Generate initial content
- [ ] Test authentication
- [ ] Test posting comments
- [ ] Verify AI replies trigger
- [ ] Check comment counts
- [ ] Test upvoting
- [ ] Test bookmarks
- [ ] Test search/filtering
- [ ] Deploy to Vercel

## Troubleshooting

**"Cannot connect to Supabase"**
- Check `.env.local` has correct URL
- Verify Supabase project is running

**"Posts not loading"**
- Check RLS policies in Supabase
- Verify table names match schema

**"AI replies not working"**
- Check DEEPSEEK_API_KEY is set
- Verify `/api/ai-reply` is accessible
- Check browser console for errors

**"Auth redirect loop"**
- Update Supabase redirect URLs
- Check callback route exists

## Next Enhancements

1. User profile pages
2. Settings page
3. Admin dashboard
4. More categories
5. Image upload for profiles
6. Post scheduling
7. Analytics dashboard

## Cost Estimate

- **Vercel**: Free tier (hobby plan if you scale)
- **Supabase**: Free tier (500MB database, 50K monthly users)
- **DeepSeek API**: ~$0.22/day at current usage

**Total: ~$7/month** for small deployment

EOF
cat DEPLOYMENT_SUMMARY.md

