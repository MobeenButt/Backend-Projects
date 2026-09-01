import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get playlists
      // const data = await playlistService.getUserPlaylists();
      // setPlaylists(data);
      
      // Temporary: Show empty state
      setPlaylists([]);
    } catch (error) {
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-medium text-youtube-text mb-2">No playlists yet</h2>
          <p className="text-youtube-text-secondary mb-4">Create playlists to organize your videos</p>
          <Button variant="primary">
            Create Playlist
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-youtube-text">Playlists</h1>
        <Button variant="primary">
          Create Playlist
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <Link
            key={playlist._id}
            to={`/playlist/${playlist._id}`}
            className="bg-youtube-surface hover:bg-youtube-hover border border-youtube-border rounded-sm overflow-hidden transition-colors"
          >
            <div className="aspect-video bg-youtube-hover flex items-center justify-center">
              <svg className="w-12 h-12 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-youtube-text">{playlist.name}</h3>
              <p className="text-sm text-youtube-text-secondary mt-1">
                {playlist.videoCount || 0} videos
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Playlists;
