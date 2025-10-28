-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  tldr text,
  category text not null,
  tags text[] default '{}',
  images text[] default '{}',
  upvotes int default 0,
  views int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  username text not null,
  content text not null,
  is_ai boolean default false,
  upvotes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User votes table (prevent duplicate votes)
create table public.post_votes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- User comment votes
create table public.comment_votes (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, user_id)
);

-- User bookmarks
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- User profiles
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  bio text,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.comment_votes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_profiles enable row level security;

-- Policies: Posts (readable by everyone)
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

-- Policies: Comments (readable by everyone, writable by authenticated users)
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Users can insert comments" on public.comments
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own comments" on public.comments
  for update using (auth.uid() = user_id);

-- Policies: Votes (authenticated users only)
create policy "Users can vote on posts" on public.post_votes
  for all using (auth.role() = 'authenticated');

create policy "Users can vote on comments" on public.comment_votes
  for all using (auth.role() = 'authenticated');

-- Policies: Bookmarks (authenticated users only)
create policy "Users can manage own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id);

-- Policies: User profiles
create policy "Profiles are viewable by everyone" on public.user_profiles
  for select using (true);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Indexes for performance
create index posts_category_idx on public.posts(category);
create index posts_created_at_idx on public.posts(created_at desc);
create index comments_post_id_idx on public.comments(post_id, created_at);
create index post_votes_user_post_idx on public.post_votes(user_id, post_id);
create index comment_votes_user_comment_idx on public.comment_votes(user_id, comment_id);
create index bookmarks_user_post_idx on public.bookmarks(user_id, post_id);

