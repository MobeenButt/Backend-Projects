import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
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
import Search from './pages/Search';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';

function App() {
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
            },
            success: {
              iconTheme: {
                primary: '#00ff00',
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <div className="flex pt-14">
                  <Sidebar />
                  <main className="flex-1 lg:ml-60">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/watch/:videoId" element={<Watch />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/subscriptions" element={<Subscriptions />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/liked" element={<Liked />} />
                      <Route path="/playlists" element={<Playlists />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/channel" element={<Channel />} />
                      <Route path="/channel/:channelId" element={<Channel />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h1 className="text-6xl font-bold mb-4 text-youtube-text">404</h1>
                            <p className="text-xl text-youtube-text-secondary">Page not found</p>
                          </div>
                        </div>
                      } />
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
