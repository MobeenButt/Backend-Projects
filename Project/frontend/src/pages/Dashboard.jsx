import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { videoService } from '../services/video.service';
import useAuthStore from '../store/useAuthStore';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/helpers';

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="card-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm text-youtube-text-secondary mb-1 truncate">{label}</p>
        <p className="text-3xl font-bold text-youtube-text">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const icons = {
  video: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  eye: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  users: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  heart: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, videosRes] = await Promise.all([
        dashboardService.getChannelStats(),
        dashboardService.getChannelVideos(1, 50),
      ]);
      setStats(statsRes.data || {});
      setVideos(videosRes.data?.docs || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (video) => {
    try {
      await videoService.togglePublish(video._id);
      toast.success(video.isPublished ? 'Video unpublished' : 'Video published');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const handleDelete = async (video) => {
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    try {
      await videoService.deleteVideo(video._id);
      toast.success('Video deleted');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const statItems = [
    { label: 'Total Videos', value: stats?.totalVideos || 0, icon: icons.video, accent: 'bg-youtube-red/10 text-youtube-red' },
    { label: 'Total Views', value: formatViews(stats?.totalViews || 0), icon: icons.eye, accent: 'bg-blue-500/10 text-blue-400' },
    { label: 'Subscribers', value: formatViews(stats?.totalSubscribers || 0), icon: icons.users, accent: 'bg-green-500/10 text-green-400' },
    { label: 'Total Likes', value: stats?.totalLikes || 0, icon: icons.heart, accent: 'bg-yellow-500/10 text-yellow-400' },
  ];

  return (
    <div className="p-4 lg:p-6 min-h-screen animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-youtube-text tracking-tight">Dashboard</h1>
        <p className="text-sm text-youtube-text-secondary mt-1">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-lg font-bold text-youtube-text mb-4">Your videos</h2>
        {videos.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            title="No videos yet"
            description="Upload your first video to see it here"
          />
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video._id}
                className="card-surface p-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors hover:bg-youtube-hover/40"
              >
                <div className="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-youtube-hover">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-medium text-white">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-youtube-text text-sm truncate">{video.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                        video.isPublished
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {video.isPublished ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-youtube-text-secondary mt-1">
                    <span>{formatViews(video.views)} views</span>
                    <span>• {video.likesCount || 0} likes</span>
                    <span>• {video.commentsCount || 0} comments</span>
                    <span>• {formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(video)}
                    className="p-2 rounded-full hover:bg-youtube-hover transition-colors text-youtube-text-secondary hover:text-youtube-text"
                    title={video.isPublished ? 'Make private' : 'Make public'}
                    aria-label="Toggle publish status"
                  >
                    {video.isPublished ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-1.622 1.622L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    className="p-2 rounded-full hover:bg-youtube-red/20 transition-colors text-youtube-text-secondary hover:text-youtube-red"
                    title="Delete video"
                    aria-label="Delete video"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;