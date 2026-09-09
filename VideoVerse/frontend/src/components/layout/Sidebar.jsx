import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: 'Home',
    path: '/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    label: 'Trending',
    path: '/trending',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    label: 'Subscriptions',
    path: '/subscriptions',
  },
];

const libraryItems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'History',
    path: '/history',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    label: 'Liked videos',
    path: '/liked',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    label: 'Playlists',
    path: '/playlists',
  },
];

const sidebarContent = ({ isActive, onNavigate }) => (
  <nav className="py-3">
    <div className="mb-3">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={`
            flex items-center gap-6 px-6 py-2.5 text-sm transition-colors relative
            ${isActive(item.path) ? 'bg-youtube-hover text-youtube-text font-medium' : 'text-youtube-text hover:bg-youtube-hover/70'}
          `}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>

    <div className="border-t border-youtube-border my-3" />

    <div>
      <p className="px-6 pb-1 text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
        Library
      </p>
      {libraryItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={`
            flex items-center gap-6 px-6 py-2.5 text-sm transition-colors
            ${isActive(item.path) ? 'bg-youtube-hover text-youtube-text font-medium' : 'text-youtube-text hover:bg-youtube-hover/70'}
          `}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  </nav>
);

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-60 bg-youtube-bg border-r border-youtube-border overflow-y-auto hidden lg:block z-30">
        {sidebarContent({ isActive })}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-youtube-bg z-50 overflow-y-auto lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-youtube-border">
                <Link to="/" onClick={onClose} className="flex items-center gap-2">
                  <svg className="w-7 h-7 text-youtube-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.582 6.186s-.152-.999-.618-1.441c-.592-.619-1.254-.622-1.558-.659C16.774 4 12.001 4 12.001 4s-4.773 0-7.405.086c-.304.037-.966.04-1.558.659-.466.442-.619 1.441-.619 1.441S2.254 7.346 2.254 8.505v1.991c0 1.159.165 2.318.165 2.318s.153.999.619 1.441c.592.619 1.368.599 1.714.665 1.244.12 7.199.157 7.199.157s4.778-.005 7.41-.091c.304-.037.966-.04 1.558-.659.466-.442.618-1.441.618-1.441s.165-1.159.165-2.318V8.505c0-1.159-.165-2.319-.165-2.319zM9.996 15.005l.001-6.005 5.75 3.005-5.751 3z" />
                  </svg>
                  <span className="text-xl font-bold text-youtube-text">VidTube</span>
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="icon-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {sidebarContent({ isActive, onNavigate: onClose })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-youtube-bg/95 backdrop-blur-sm border-t border-youtube-border lg:hidden z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-1">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/') ? 'text-youtube-text' : 'text-youtube-text-secondary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            to="/subscriptions"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/subscriptions') ? 'text-youtube-text' : 'text-youtube-text-secondary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-medium">Subscriptions</span>
          </Link>

          <Link
            to="/upload"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/upload') ? 'text-youtube-text' : 'text-youtube-text-secondary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Upload</span>
          </Link>

          <Link
            to="/liked"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/liked') ? 'text-youtube-text' : 'text-youtube-text-secondary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-[10px] font-medium">Liked</span>
          </Link>

          <Link
            to="/playlists"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/playlists') ? 'text-youtube-text' : 'text-youtube-text-secondary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px] font-medium">Library</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;