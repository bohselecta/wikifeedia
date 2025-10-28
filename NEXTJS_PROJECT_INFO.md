# Next.js Wikifeedia - Project Information

## 🎯 What You Have

A complete **Next.js 14** application with:
- ✅ Supabase backend (database + auth + realtime)
- ✅ Email authentication (magic links)
- ✅ AI-powered content generation
- ✅ Comment system with AI replies
- ✅ Duplicate prevention registry
- ✅ Real-time updates
- ✅ User profiles and settings
- ✅ Search and filtering

## 📁 Project Structure

```
wikifeedia/
├── app/                      # Next.js app directory
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main feed page  
│   ├── globals.css           # Global styles
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts      # Auth callback handler
│   └── api/
│       └── ai-reply/
│           └── route.ts      # AI reply API
├── components/               # React components
│   ├── Header.tsx            # Navigation + search + filters
│   ├── AuthButton.tsx        # Login/logout UI
│   ├── PostCard.tsx          # Post display + actions
│   └── CommentSection.tsx   # Comments with AI replies
├── lib/                      # Utilities
│   ├── supabase.ts           # Supabase client
│   ├── types.ts              # TypeScript definitions
│   ├── content.ts            # Content helpers
│   └── database/
│       └── schema.sql        # Database schema
├── scripts/
│   └── generate_initial_content.py  # Content generator
├── .env.local.example        # Environment template
├── .gitignore               # Git ignore rules
├── next.config.js           # Next.js config
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── QUICK_START_CHECKLIST.md # Setup instructions
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email magic links)
- **AI**: DeepSeek API
- **Deployment**: Vercel (ready to deploy)

## 🔑 Key Features

### Content Management
- **AI Generation**: DeepSeek creates engaging posts from Wikipedia
- **Duplicate Prevention**: Registry tracks posted titles
- **Bot Comments**: AI bots seed discussion threads
- **AI Replies**: Bots reply to user comments (30% chance)

### User Features
- **Email Auth**: Sign in with magic links (no password)
- **Comments**: Users can post, bots can reply
- **Upvotes**: Persistent voting per user
- **Bookmarks**: Save posts for later
- **Profiles**: User settings and data

### Technical
- **Real-time**: Supabase subscriptions for live updates
- **Accurate Counts**: Comment counts from database
- **RLS Security**: Row Level Security policies
- **TypeScript**: Full type safety

## 📊 Database Schema

- **posts** - Generated content with metadata
- **comments** - User and AI comments (is_ai flag)
- **post_votes** - Tracks user votes (prevents duplicates)
- **comment_votes** - Tracks comment upvotes
- **bookmarks** - User saved posts
- **user_profiles** - User settings and data

## 🚀 Deployment Flow

1. **Develop locally** (`npm run dev`)
2. **Push to GitHub**
3. **Connect to Vercel**
4. **Add env variables in Vercel**
5. **Update Supabase redirect URLs**
6. **Deploy!**

## 📝 Next Steps

1. Set up Supabase project
2. Run database schema
3. Configure environment variables
4. Generate initial content
5. Test locally
6. Deploy to Vercel

See **QUICK_START_CHECKLIST.md** for detailed steps.

## 🎨 Styling

- Dark theme by default
- Tailwind CSS utility classes
- Responsive design
- Smooth animations
- Gradient buttons
- Category color coding

## 🤖 AI Features

### Content Generation
- Hook-based titles
- Engaging 2-4 paragraph content
- Category assignment
- Quality scoring
- TL;DR summaries

### Bot Personas
- 🤖 ScienceNerd_ - Asks questions
- 🤖 HistoryBuff1987 - Adds context
- 🤖 CasualLurker - Reacts casually
- 🤖 FunFactBot - Shares facts

### Reply System
- 30% chance to reply to user comments
- Contextual responses
- Natural conversation flow
- Keeps threads engaging

## 🔐 Security

- Row Level Security (RLS) policies
- One vote per user per post/comment
- Authenticated comment posting
- Email verification
- Secure API keys in environment variables

## 💰 Cost Estimate

- **Vercel**: Free tier (hobby plan if scaling)
- **Supabase**: Free tier (500MB DB, 50K users/month)
- **DeepSeek API**: ~$0.22/day for generation

**Monthly: ~$7** for small deployment

## 📚 Documentation Files

- `QUICK_START_CHECKLIST.md` - Setup steps
- `DEPLOYMENT_SUMMARY.md` - Technical details
- `SETUP_NEXTJS.md` - Complete guide
- `NEXTJS_PROJECT_INFO.md` - This file

## ✨ What Makes This Special

1. **Smart AI** - DeepSeek generates engaging, hook-based content
2. **No Duplicates** - Registry prevents posting same content twice
3. **Bot Engagement** - AI bots keep threads active
4. **Accurate Counts** - Database is single source of truth
5. **Real-time** - Supabase subscriptions for instant updates
6. **Email Auth** - Password-less sign in
7. **Type Safety** - Full TypeScript coverage
8. **Production Ready** - Deploy to Vercel in minutes

---

**Ready to launch! Follow QUICK_START_CHECKLIST.md 🚀**

