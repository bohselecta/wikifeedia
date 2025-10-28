'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import CommentSection from './CommentSection'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [upvoted, setUpvoted] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [postData, setPostData] = useState(post)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        checkVoteStatus()
        checkBookmarkStatus()
      }
    })
  }, [])

  async function checkVoteStatus() {
    if (!user) return
    const { count } = await supabase
      .from('post_votes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
      .eq('user_id', user.id)

    setUpvoted((count || 0) > 0)
  }

  async function checkBookmarkStatus() {
    if (!user) return
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
      .eq('user_id', user.id)

    setBookmarked((count || 0) > 0)
  }

  async function handleUpvote() {
    if (!user) {
      alert('Please sign in to upvote')
      return
    }

    if (upvoted) {
      // Remove vote
      await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)

      await supabase
        .from('posts')
        .update({ upvotes: postData.upvotes - 1 })
        .eq('id', post.id)

      setUpvoted(false)
      setPostData({ ...postData, upvotes: postData.upvotes - 1 })
    } else {
      // Add vote
      await supabase
        .from('post_votes')
        .insert({ post_id: post.id, user_id: user.id })

      await supabase
        .from('posts')
        .update({ upvotes: postData.upvotes + 1 })
        .eq('id', post.id)

      setUpvoted(true)
      setPostData({ ...postData, upvotes: postData.upvotes + 1 })
    }
  }

  async function handleBookmark() {
    if (!user) {
      alert('Please sign in to bookmark')
      return
    }

    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
      setBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({ post_id: post.id, user_id: user.id })
      setBookmarked(true)
    }
  }

  return (
    <div className="bg-[#141414] rounded-xl border border-[#262626] max-w-[780px] transition-all duration-200 hover:border-[#333] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 mx-auto mb-6">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-semibold text-white uppercase tracking-wide" style={{ backgroundColor: getCategoryColor(post.category) as string }}>
              {post.category}
            </span>
            <span className="text-xs text-[#6b6b6b]">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          {user && (
            <button onClick={handleBookmark} className="text-xl hover:scale-110 transition-transform">
              {bookmarked ? '⭐' : '☆'}
            </button>
          )}
        </div>

        {/* Title */}
        <h2 
          className="text-[30px] font-bold text-white mb-4 cursor-pointer hover:text-[#3b82f6] leading-tight tracking-tight transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {post.title}
        </h2>

        {/* Image */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6 rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
            <img
              src={post.images[0]}
              alt={post.title}
              className="max-w-full max-h-64 object-contain"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        {/* TLDR */}
        <div className="flex gap-2 px-4 py-3 bg-[rgba(59,130,246,0.1)] border-l-[3px] border-[#3b82f6] rounded-md mb-4">
          <span className="text-sm font-bold text-[#3b82f6] flex-shrink-0">TL;DR:</span>
          <p className="text-sm text-[#b4b4b4] leading-relaxed">{post.tldr}</p>
        </div>

        {/* Content */}
        <div className={`text-[#b4b4b4] mb-6 leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
          <div className="space-y-4 whitespace-pre-wrap">{post.content}</div>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[#3b82f6] hover:text-[#2563eb] mt-2 font-semibold"
            >
              Read More...
            </button>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-[#6b6b6b] px-2.5 py-1 bg-[#1a1a1a] rounded border border-[#262626] hover:text-[#3b82f6] hover:border-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)] cursor-pointer transition-all"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Expanded Comments */}
        {expanded && (
          <CommentSection postId={post.id} postTitle={post.title} />
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-1 pt-4 mt-4 border-t border-[#262626]">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-all ${
              upvoted ? 'text-[#f97316] bg-[rgba(249,115,22,0.1)]' : 'text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f97316]'
            }`}
          >
            <span className="text-base">⬆</span>
            <span>{postData.upvotes}</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#3b82f6] font-medium transition-all"
          >
            <span>💬</span>
            <span>{post.commentCount || 0}</span>
          </button>

          <span className="flex items-center gap-1.5 px-3 py-2 text-[#6b6b6b]">
            <span>👁</span>
            <span>{post.views}</span>
          </span>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#6b6b6b] font-medium transition-all">
            <span>↗</span>
            <span className="hidden sm:inline">Share</span>
          </button>

          <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[#6b6b6b] hover:bg-[#1a1a1a] font-medium transition-all">
            <span>📖</span>
            <span className="hidden sm:inline">Wikipedia</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'History': '#8B4513',
    'Science': '#4169E1',
    'Technology': '#32CD32',
    'Nature': '#228B22',
    'Culture': '#FF69B4',
    'Biography': '#FF8C00',
    'Mystery': '#9370DB'
  }
  return colors[category] || '#3b82f6'
}

