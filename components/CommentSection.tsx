'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/lib/types'
import { User } from '@supabase/supabase-js'

interface CommentSectionProps {
  postId: string
  postTitle: string
}

export default function CommentSection({ postId, postTitle }: CommentSectionProps) {
  const [user, setUser] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    loadComments()
    
    // Listen for new comments
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => loadComments())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading comments:', error)
    } else {
      setComments(data || [])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)
    
    // Get username
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const username = profile?.username || user.email?.split('@')[0] || 'Anonymous'

    // Insert comment
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        username,
        content: newComment,
        is_ai: false
      })

    if (error) {
      alert('Error posting comment: ' + error.message)
    } else {
      setNewComment('')
      
      // Trigger AI reply (async)
      triggerAIReply(postTitle, newComment, postId, username)
    }
    setLoading(false)
  }

  async function triggerAIReply(title: string, userComment: string, postId: string, username: string) {
    // Check if AI should reply (30% chance)
    if (Math.random() > 0.3) return

    try {
      const response = await fetch('/api/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, userComment, postId, username })
      })

      const data = await response.json()
      
      if (data.reply) {
        // Insert AI reply
        await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: null,
            username: 'AI_Bot',
            content: data.reply,
            is_ai: true
          })
      }
    } catch (error) {
      console.error('AI reply error:', error)
    }
  }

  return (
    <div className="mt-6 border-t border-[#262626] pt-6">
      <h4 className="text-lg font-bold text-white mb-4">
        💬 Comments ({comments.length})
      </h4>

      {/* Comments List */}
      <div className="space-y-3 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#262626] mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-semibold">
                  {comment.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-white">{comment.username}</span>
                {comment.is_ai && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] rounded text-[#3b82f6]">
                    🤖 AI
                  </span>
                )}
                {!comment.is_ai && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-[rgba(59,130,246,0.1)] border border-[#6b6b6b] rounded text-[#6b6b6b]">
                    👤
                  </span>
                )}
              </div>
              <span className="text-xs text-[#6b6b6b]">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-[#b4b4b4] leading-normal mb-3 whitespace-pre-wrap">{comment.content}</p>
            <div className="flex gap-3">
              <button className="flex items-center gap-1 px-2 py-1 text-[13px] text-[#6b6b6b] hover:bg-[#262626] rounded transition-all">
                ⬆ {comment.upvotes}
              </button>
              <button className="px-2 py-1 text-[13px] text-[#6b6b6b] hover:bg-[#262626] rounded transition-all">
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-2 bg-[#141414] text-white rounded-lg border border-[#262626] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] mb-3"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="text-[#b4b4b4] text-sm text-center py-4 border border-[#262626] rounded-lg">
          Sign in to add comments
        </p>
      )}
    </div>
  )
}

