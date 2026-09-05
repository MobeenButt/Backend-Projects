import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { videoService } from '../services/video.service';
import { subscriptionService } from '../services/subscription.service';
import { playlistService } from '../services/playlist.service';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/helpers';

const Channel = () => {
  const { channelId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');

  const targetUserId = channelId || user?._id;

  useEffect(() => {
    if (targetUserId) loadChannelData();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  const loadChannelData = async () => {
    setLoading(true);
    try {
      // Fetch the channel's public videos to derive channel info + content
      const videoResponse = await videoService.getAllVideos({
        userId: targetUserId,
        limit: 24,
        sortBy: 'createdAt',
        sortType: 'desc',
      });
      const channelVideos = videoResponse.data?.docs || [];
      setVideos(channelVideos);

      // Channel info from video owner (or logged-in user for own channel)
      if (targetUserId === user?._id && user) {
        setChannel(user);
      } else if (channelVideos.length > 0) {
        setChannel(channelVideos[0].owner);
      }

      // Subscriber count
      try {
        const subResponse = await subscriptionService.getChannelSubscribers(targetUserId);
        setSubscriberCount((subResponse.data || []).length);
      } catch {
        setSubscriberCount(0);
      }

      // Playlists for the channel user
      try {
        const plResponse = await playlistService.getUserPlaylists(targetUserId);
        setPlaylists(plResponse.data || []);
      } catch {
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/channel/${channelId}` } });
      return;
    }
    setSubLoading(true);
    try {
      await subscriptionService.toggleSubscription(targetUserId);
      const isNowSubscribed = !isSubscribed;
      setIsSubscribed(isNowSubscribed);
      setSubscriberCount((c) => c + (isNowSubscribed ? 1 : -1));
      toast.success(isNowSubscribed ? 'Subscribed!' : 'Unsubscribed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Channel not found"
          description="This channel may not exist or has no public videos"
        />
      </div>
    );
  }

  const isOwnChannel = channel._id === user?._id;

  const tabs = [
    { id: 'videos', label: 'Videos', count: videos.length },
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Channel Header */}
      <div className="bg-youtube-surface/50 border-b border-youtube-border">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Avatar
              src={channel.avatar}
              alt={channel.fullName}
              size="2xl"
              fallback={channel.fullName}
              className="border-4 border-youtube-bg shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-youtube-text truncate">
                {channel.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-youtube-text-secondary mt-1.5">
                <span>@{channel.username}</span>
                <span>{formatViews(subscriberCount)} subscribers</span>
                <span>{videos.length} videos</span>
              </div>
            </div>
            {!isOwnChannel && (
              <div className="flex-shrink-0">
                <Button
                  variant={isSubscribed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleSubscribe}
                  loading={subLoading}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors relative flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'text-youtube-text'
                    : 'text-youtube-text-secondary hover:text-youtube-text'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-youtube-text rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              title="No public videos yet"
              description={isOwnChannel ? 'Upload a video to get started' : 'Check back later'}
            />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <VideoCardInner key={video._id} video={video} />
              ))}
            </div>
          )
        )}

        {activeTab === 'playlists' && (
          playlists.length === 0 ? (
            <EmptyState
              title="No playlists"
              description="No playlists available for this channel"
            />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((p) => (
                <div key={p._id} className="card-surface overflow-hidden">
                  <div className="aspect-video bg-youtube-hover flex items-center justify-center">
                    {p.firstVideoThumbnail ? (
                      <img src={p.firstVideoThumbnail} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <svg className="w-10 h-10 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-youtube-text truncate">{p.name}</h3>
                    <p className="text-sm text-youtube-text-secondary">{p.totalVideos || 0} videos</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="card-surface p-6">
              <h3 className="text-lg font-medium text-youtube-text mb-4">About</h3>
              <div className="space-y-3 text-sm text-youtube-text-secondary">
                <p>Channel: {channel.fullName}</p>
                <p>{formatViews(subscriberCount)} subscribers</p>
                <p>Joined: {new Date(channel.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Local video card for the channel grid
const VideoCardInner = ({ video }) => {
  return (
    <Link to={`/watch/${video._id}`} className="block group">
      <div className="relative w-full aspect-video bg-youtube-surface rounded-xl overflow-hidden mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-youtube-text line-clamp-2 leading-snug group-hover:text-youtube-text-secondary transition-colors">
        {video.title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-youtube-text-secondary mt-1">
        <span>{formatViews(video.views)} views</span>
        <span>•</span>
        <span>{formatTimeAgo(video.createdAt)}</span>
      </div>
    </Link>
  );
};

export default Channel;