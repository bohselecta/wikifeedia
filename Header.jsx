import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Auth stub - replace with real auth later
  const isAuthenticated = false;
  const user = {
    name: "Alex Chen",
    avatar: "AC"
  };

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
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white text-xl font-bold">W</span>
                </div>
                <h1 
                  className="text-2xl tracking-tight text-white transition-colors duration-200 group-hover:text-blue-400"
                  style={{ 
                    fontFamily: "'Roboto Serif', serif",
                    fontWeight: 500,
                    letterSpacing: '-0.02em' // Perfect kerning
                  }}
                >
                  Wikifeedia
                </h1>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href="/" 
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  Feed
                </Link>
                <Link 
                  href="/trending" 
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  Trending
                </Link>
                <Link 
                  href="/saved" 
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  Saved
                </Link>
                <Link 
                  href="/categories" 
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  Categories
                </Link>
              </nav>
            </div>

            {/* Right Side - Search & Auth */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden sm:block relative">
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
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                <span>✨</span>
                <span>Surprise Me</span>
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors duration-150"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.avatar}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-lg py-2">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">Premium Member</p>
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
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150">
                    Log In
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-150">
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tagline (optional - can be toggled) */}
        <div className="border-t border-gray-800 bg-gray-900 bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center py-2 text-xs text-gray-400 tracking-wide">
              Where Wikipedia meets your feed — AI-curated knowledge, endlessly interesting
            </p>
          </div>
        </div>
      </header>
    </>
  );
}
