'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') {
        setShowLogin(false)
      }
    })
  }, [])

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300">{user.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(!showLogin)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md font-medium transition-all border border-gray-700 hover:border-gray-600"
      >
        Sign In
      </button>

      {showLogin && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-4">Sign In with Email</h3>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

