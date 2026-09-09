import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close user menu on outside click / Escape
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchMobile(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const openSidebar = () => {
    onMenuClick?.();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-youtube-bg/95 backdrop-blur-sm border-b border-youtube-border">
        <div className="flex items-center justify-between h-14 px-2 sm:px-4 gap-2">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-shrink-0">
            <Tooltip content="Menu">
              <button
                onClick={openSidebar}
                aria-label="Menu"
                className="icon-btn lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </Tooltip>
            <Link to="/" className="flex items-center gap-1 sm:gap-2 group">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-youtube-red flex-shrink-0 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.582 6.186s-.152-.999-.618-1.441c-.592-.619-1.254-.622-1.558-.659C16.774 4 12.001 4 12.001 4s-4.773 0-7.405.086c-.304.037-.966.04-1.558.659-.466.442-.619 1.441-.619 1.441S2.254 7.346 2.254 8.505v1.991c0 1.159.165 2.318.165 2.318s.153.999.619 1.441c.592.619 1.368.599 1.714.665 1.244.12 7.199.157 7.199.157s4.778-.005 7.41-.091c.304-.037.966-.04 1.558-.659.466-.442.618-1.441.618-1.441s.165-1.159.165-2.318V8.505c0-1.159-.165-2.319-.165-2.319zM9.996 15.005l.001-6.005 5.75 3.005-5.751 3z" />
              </svg>
              <span className="text-lg sm:text-xl font-bold text-youtube-text hidden xs:block tracking-tight">
                VidTube
              </span>
            </Link>
          </div>

          {/* Center: Desktop Search */}
          {!showSearchMobile && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl mx-auto justify-center"
            >
              <div className="flex items-center w-full max-w-xl">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    aria-label="Search"
                    className="w-full bg-youtube-surface/80 border border-youtube-border rounded-l-full px-4 py-2 text-sm text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:border-blue-500 focus:bg-youtube-bg transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="px-5 py-2 bg-youtube-surface border border-youtube-border border-l-0 rounded-r-full hover:bg-youtube-hover transition-colors"
                >
                  <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              aria-label="Search"
              className="icon-btn md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                <Tooltip content="Upload video">
                  <Link to="/upload" className="hidden sm:block">
                    <button aria-label="Upload" className="icon-btn">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </Link>
                </Tooltip>

                <Tooltip content="Notifications">
                  <button aria-label="Notifications" className="icon-btn hidden sm:block">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </Tooltip>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="Account menu"
                    className="hover:opacity-80 transition-opacity flex items-center"
                  >
                    <Avatar
                      src={user?.avatar}
                      alt={user?.fullName || 'User'}
                      size="sm"
                      fallback={user?.fullName || 'User'}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-youtube-surface border border-youtube-border rounded-lg shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-youtube-border">
                          <p className="font-medium text-youtube-text text-sm truncate">{user?.fullName}</p>
                          <p className="text-xs text-youtube-text-secondary truncate mt-0.5">@{user?.username}</p>
                        </div>

                        <Link
                          to="/channel"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-youtube-hover transition-colors text-sm"
                        >
                          <svg className="w-5 h-5 text-youtube-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-youtube-text">Your channel</span>
                        </Link>

                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-youtube-hover transition-colors text-sm"
                        >
                          <svg className="w-5 h-5 text-youtube-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-youtube-text">Dashboard</span>
                        </Link>

                        <Link
                          to="/upload"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-youtube-hover transition-colors text-sm sm:hidden"
                        >
                          <svg className="w-5 h-5 text-youtube-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-youtube-text">Upload video</span>
                        </Link>

                        <Link
                          to="/history"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-youtube-hover transition-colors text-sm"
                        >
                          <svg className="w-5 h-5 text-youtube-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-youtube-text">Watch history</span>
                        </Link>

                        <div className="border-t border-youtube-border">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-youtube-hover transition-colors text-sm"
                          >
                            <svg className="w-5 h-5 text-youtube-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-youtube-text">Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outlined" size="sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden xs:inline">Sign in</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearchMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-2 pb-2 md:hidden border-t border-youtube-border overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSearchMobile(false)}
                  aria-label="Close search"
                  className="icon-btn flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    aria-label="Search"
                    autoFocus
                    className="w-full bg-youtube-surface border border-youtube-border rounded-l-full px-4 py-2 text-sm text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="px-4 py-2 bg-youtube-surface border border-youtube-border border-l-0 rounded-r-full"
                  >
                    <svg className="w-5 h-5 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;