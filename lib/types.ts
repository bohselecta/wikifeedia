export interface Post {
  id: string
  title: string
  content: string
  tldr: string
  category: string
  tags: string[]
  images: string[]
  upvotes: number
  views: number
  created_at: string
  updated_at?: string
  commentCount?: number
}

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  username: string
  content: string
  is_ai: boolean
  upvotes: number
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  bio?: string
}

