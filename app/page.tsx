'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import Header from '@/components/Header'
import { Post } from '@/lib/types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [selectedCategory])

  async function loadPosts() {
    try {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20)

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Load comment counts for each post
      const postsWithComments = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          return {
            ...post,
            commentCount: count || 0
          }
        })
      )

      setPosts(postsWithComments)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />
      
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">No posts found. Generate some posts to get started!</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all">
                Generate Posts
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

