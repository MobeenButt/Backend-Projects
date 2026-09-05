import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playlistService } from '../services/playlist.service';
import useAuthStore from '../store/useAuthStore';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import VideoCard from '../components/video/VideoCard';
import toast from 'react-hot-toast';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const { user } = useAuthStore();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  const loadPlaylist = async () => {
    setLoading(true);
    try {
      const response = await playlistService.getPlaylist(playlistId);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Failed to load playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    setRemoving(true);
    try {
      await playlistService.removeVideoFromPlaylist(playlistId, videoId);
      toast.success('Video removed from playlist');
      loadPlaylist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove video');
    } finally {
      setRemoving(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      await playlistService.deletePlaylist(playlistId);
      toast.success('Playlist deleted');
      window.location.href = '/playlists';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Playlist not found"
          description="This playlist may have been deleted"
        />
      </div>
    );
  }

  const isOwner = user?._id === playlist.owner?._id;
  const videos = playlist.videos || [];

  return (
    <div className="min-h-screen pb-8 animate-fade-in">
      <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-youtube-red/20 via-youtube-surface to-youtube-surface/40 border border-youtube-border p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <p className="text-sm text-youtube-text-secondary mb-2">
                {videos.length.toLocaleString()} {videos.length === 1 ? 'video' : 'videos'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-youtube-text mb-3">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-sm text-youtube-text-secondary mb-3 line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-youtube-text-secondary">
                <span>{playlist.totalVideos || videos.length} videos</span>
                {playlist.owner && (
                  <>
                    <span>•</span>
                    <Link
                      to={`/channel/${playlist.owner._id}`}
                      className="hover:text-youtube-text transition-colors"
                    >
                      {playlist.owner.fullName}
                    </Link>
                  </>
                )}
              </div>
            </div>
            {isOwner && (
              <button
                onClick={handleDeletePlaylist}
                className="btn btn-outlined text-youtube-text-secondary hover:text-youtube-red hover:border-youtube-red flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Videos */}
        {videos.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="No videos in this playlist"
            description={isOwner ? 'Add videos from any watch page' : 'This playlist is empty'}
          />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <div key={video._id} className="relative">
                <VideoCard video={video} />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    disabled={removing}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-youtube-red transition-colors"
                    title="Remove from playlist"
                    aria-label="Remove from playlist"
                  >
                    {removing ? (
                      <Loader size="sm" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;