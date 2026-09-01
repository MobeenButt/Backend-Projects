import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-youtube-bg border-b border-youtube-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-youtube-hover rounded-full transition-colors lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-1">
            <svg className="w-7 h-7 text-youtube-red" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.582 6.186s-.152-.999-.618-1.441c-.592-.619-1.254-.622-1.558-.659C16.774 4 12.001 4 12.001 4s-4.773 0-7.405.086c-.304.037-.966.04-1.558.659-.466.442-.619 1.441-.619 1.441S2.254 7.346 2.254 8.505v1.991c0 1.159.165 2.318.165 2.318s.153.999.619 1.441c.592.619 1.368.599 1.714.665 1.244.12 7.199.157 7.199.157s4.778-.005 7.41-.091c.304-.037.966-.04 1.558-.659.466-.442.618-1.441.618-1.441s.165-1.159.165-2.318V8.505c0-1.159-.165-2.319-.165-2.319zM9.996 15.005l.001-6.005 5.75 3.005-5.751 3z"/>
            </svg>
            <span className="text-xl font-bold text-youtube-text hidden sm:block">VidTube</span>
          </Link>
        </div>

        {/* Center - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-youtube-bg border border-youtube-border rounded-l-full px-4 py-2 text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-youtube-surface border border-youtube-border border-l-0 rounded-r-full hover:bg-youtube-hover transition-colors"
            >
              <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/upload" className="hidden sm:block">
                <button className="p-2 hover:bg-youtube-hover rounded-full transition-colors">
                  <svg className="w-6 h-6 text-youtube-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.fullName || 'User'} 
                    size="sm"
                    fallback={user?.fullName || 'User'}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-youtube-surface border border-youtube-border rounded-sm shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-youtube-border">
                      <p className="font-medium text-youtube-text text-sm">{user?.fullName}</p>
                      <p className="text-xs text-youtube-text-secondary">@{user?.username}</p>
                    </div>
                    
                    <Link
                      to="/channel"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-youtube-text">Your channel</span>
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-youtube-text">Dashboard</span>
                    </Link>
                    
                    <div className="border-t border-youtube-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover transition-colors text-sm"
                      >
                        <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-youtube-text">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outlined" size="sm" className="hidden sm:inline-flex">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-youtube-bg border border-youtube-border rounded-l-full px-4 py-1.5 text-sm text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-youtube-surface border border-youtube-border border-l-0 rounded-r-full"
          >
            <svg className="w-4 h-4 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
