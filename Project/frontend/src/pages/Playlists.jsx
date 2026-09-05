import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { playlistService } from '../services/playlist.service';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const Playlists = () => {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user?._id) loadPlaylists();
  }, [user?._id]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const response = await playlistService.getUserPlaylists(user._id);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Playlist name is required');
      return;
    }
    setCreating(true);
    try {
      await playlistService.createPlaylist(formData.name.trim(), formData.description.trim());
      toast.success('Playlist created');
      setShowCreate(false);
      setFormData({ name: '', description: '' });
      loadPlaylists();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      await playlistService.deletePlaylist(id);
      toast.success('Playlist deleted');
      loadPlaylists();
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-youtube-text tracking-tight">Playlists</h1>
          <p className="text-sm text-youtube-text-secondary mt-1">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)} size="sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No playlists yet"
          description="Create playlists to organize your videos"
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)} size="sm">
              Create playlist
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="group card-surface overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Link to={`/playlists/${playlist._id}`} className="block">
                <div className="relative aspect-video bg-youtube-hover flex items-center justify-center overflow-hidden">
                  {playlist.firstVideoThumbnail ? (
                    <img
                      src={playlist.firstVideoThumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-youtube-text truncate">{playlist.name}</h3>
                  <p className="text-sm text-youtube-text-secondary mt-0.5">
                    {playlist.totalVideos || 0} videos
                  </p>
                  {playlist.description && (
                    <p className="text-xs text-youtube-text-secondary mt-1 line-clamp-1">
                      {playlist.description}
                    </p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleDelete(playlist._id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-youtube-red"
                aria-label={`Delete ${playlist.name}`}
                title="Delete playlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create new playlist"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. My Favorites"
            required
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-youtube-text mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Playlists;