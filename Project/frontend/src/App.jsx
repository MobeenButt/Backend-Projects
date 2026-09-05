import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AuthGuard from './components/common/AuthGuard';
import useAuthStore from './store/useAuthStore';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import Subscriptions from './pages/Subscriptions';
import Trending from './pages/Trending';
import History from './pages/History';
import Liked from './pages/Liked';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Search from './pages/Search';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';

const Protected = ({ children }) => <AuthGuard>{children}</AuthGuard>;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loadUser } = useAuthStore();

  // Restore/validate session from cookies on first load
  useEffect(() => {
    if (isAuthenticated) return;
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-youtube-bg text-youtube-text">
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#212121',
              color: '#f1f1f1',
              border: '1px solid #3f3f3f',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#212121',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff0000',
                secondary: '#212121',
              },
            },
          }}
        />

        <Routes>
          {/* Public auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App layout */}
          <Route
            path="*"
            element={
              <>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="flex pt-14">
                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />
                  <main className="flex-1 lg:ml-60 pb-16 lg:pb-0 min-w-0">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/watch/:videoId" element={<Watch />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/channel/:channelId" element={<Channel />} />
                      <Route path="/channel" element={<Channel />} />

                      {/* Protected routes */}
                      <Route path="/upload" element={<Protected><Upload /></Protected>} />
                      <Route path="/subscriptions" element={<Protected><Subscriptions /></Protected>} />
                      <Route path="/history" element={<Protected><History /></Protected>} />
                      <Route path="/liked" element={<Protected><Liked /></Protected>} />
                      <Route path="/playlists" element={<Protected><Playlists /></Protected>} />
                      <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
                      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center animate-fade-in">
                              <h1 className="text-7xl font-black text-youtube-text mb-4">404</h1>
                              <p className="text-xl text-youtube-text-secondary mb-6">
                                This page isn't available
                              </p>
                              <a
                                href="/"
                                className="btn btn-primary"
                              >
                                Go to Home
                              </a>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </main>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;