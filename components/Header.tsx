'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import AuthButton from './AuthButton'

interface HeaderProps {
  onCategoryChange: (category: string | null) => void
  selectedCategory: string | null
}

export default function Header({ onCategoryChange, selectedCategory }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const categories = [
    { name: 'All', value: null },
    { name: 'History', value: 'History' },
    { name: 'Nature', value: 'Nature' },
    { name: 'Science', value: 'Science' },
    { name: 'Technology', value: 'Technology' },
  ]

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@500&display=swap');
      `}</style>
      
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-14 h-14 transform group-hover:scale-105 transition-transform duration-200">
                  <img 
                    src="/logo-mark.svg" 
                    alt="Wikifeedia" 
                    className="w-full h-full"
                  />
                </div>
                <h1 className="text-2xl tracking-tight text-white transition-colors duration-200 group-hover:text-blue-400 font-['Roboto_Serif'] font-medium [-webkit-font-smoothing:antialiased]">
                  Wikifeedia
                </h1>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-0">
                <button 
                  onClick={() => onCategoryChange(null)}
                  className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md transition-all duration-150"
                >
                  Feed
                </button>
                <button className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md transition-all duration-150">
                  Trending
                </button>
                <button className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md transition-all duration-150">
                  Saved
                </button>
                <button className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md transition-all duration-150">
                  Categories
                </button>
              </nav>
            </div>

            {/* Right Side - Search & Auth */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>

              {/* Surprise Me Button */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-md transition-all duration-150 border border-gray-700 hover:border-gray-600">
                <span>✨</span>
                <span className="hidden lg:inline">Surprise Me</span>
              </button>

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors duration-150"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {userInitials}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-lg py-2">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-sm font-medium text-white">{user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Your Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={async () => {
                          await supabase.auth.signOut()
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AuthButton />
                </div>
              )}

              {/* Mobile/Tablet Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="border-t border-gray-800 bg-gray-900 bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => onCategoryChange(cat.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                      selectedCategory === cat.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              
              <p className="text-center text-xs text-gray-400 tracking-wide hidden lg:block">
                Where Wikipedia meets your feed — AI-curated knowledge, endlessly interesting
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

