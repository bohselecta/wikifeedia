# Wikifeedia - Next.js Setup

## Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run \`lib/database/schema.sql\`
3. Copy your project URL and anon key
4. Create \`.env.local\` from \`.env.local.example\`
5. Add your credentials

### 3. Generate Initial Content

Run the content generator to create 5 posts with AI comments:
\`\`\`bash
python3 generate_initial_content.py
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## Features

- ✅ User authentication via Supabase (email magic links)
- ✅ User profiles and settings
- ✅ Comments with real-time counts
- ✅ Upvotes that persist
- ✅ AI bot comments to seed discussion
- ✅ AI replies to user comments
- ✅ Bookmarks
- ✅ Category filtering
- ✅ Search

## Project Structure

\`\`\`
app/
  page.tsx          # Main feed
  layout.tsx        # Root layout
  auth/
    callback.tsx    # Auth callback handler
components/
  Header.tsx        # Navigation
  PostCard.tsx      # Post display
  AuthButton.tsx    # Login/logout
lib/
  supabase.ts       # Supabase client
  types.ts          # TypeScript types
  content.ts        # Content utilities
\`\`\`
