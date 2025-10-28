# 🚀 START HERE - Wikifeedia Next.js Setup

## What You Have

A complete **Next.js 14** application ready to deploy with:
- Supabase backend for database and auth
- Email magic link authentication
- AI-powered content generation
- Smart duplicate prevention
- Real-time updates
- User comments with AI replies

## Quick Setup (5 Steps)

### 1️⃣ Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2️⃣ Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **SQL Editor**
4. Run \`lib/database/schema.sql\`

### 3️⃣ Configure Environment
1. Copy \`.env.local.example\` to \`.env.local\`
2. Add your Supabase credentials
3. Add your DeepSeek API key

### 4️⃣ Generate Initial Content
\`\`\`bash
python3 scripts/generate_initial_content.py
\`\`\`

Creates 5 posts with AI bot comments + registry

### 5️⃣ Run the App
\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

## 📚 Documentation

- **QUICK_START_CHECKLIST.md** - Detailed setup steps
- **DEPLOYMENT_SUMMARY.md** - Technical deep-dive
- **NEXTJS_PROJECT_INFO.md** - Project overview
- **SETUP_NEXTJS.md** - Complete guide

## 🎯 Key Features

### ✅ Duplicate Prevention
- AI checks registry before posting
- Never posts same content twice
- Works across deployments

### ✅ Comment Counts
- Always accurate from database
- Real-time updates
- Shows actual comment count

### ✅ AI Reply System
- 30% chance AI replies to user comments
- Bots seed discussion with initial comments
- Random AI insertion into human chains

### ✅ User Accounts
- Email magic link sign in
- Persistent upvotes and bookmarks
- User profiles with settings

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Update Supabase redirect URLs
5. Deploy!

See **QUICK_START_CHECKLIST.md** for details.

---

**Ready! Start with step 1 above.** ✅
