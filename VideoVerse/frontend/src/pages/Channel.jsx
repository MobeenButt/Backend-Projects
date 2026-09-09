import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { videoService } from '../services/video.service';
import { channelService } from '../services/channel.service';
import { playlistService } from '../services/playlist.service';
import { subscriptionService } from '../services/subscription.service';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import VideoCard from '../components/video/VideoCard';
import toast from 'react-hot-toast';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/helpers';

const Channel = () => {
  const { channelId } = useParams(); // This can be a userId or username
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');

  // If no channelId param, show the logged-in user's own channel
  const isOwnChannelPage = !channelId;

  useEffect(() => {
    loadChannelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, user?._id]);

  const loadChannelData = async () => {
    setLoading(true);
    try {
      let channelData = null;
      let targetUserId = null;

      if (isOwnChannelPage) {
        // Own channel: use the logged-in user object directly
        if (!user) { setLoading(false); return; }
        channelData = user;
        targetUserId = user._id;
      } else {
        // Try fetching by userId first (links from VideoCard use _id)
        // Fall back to username lookup if the param looks like a username string
        try {
          const res = await videoService.getAllVideos({ userId: channelId, limit: 1 });
          const ownerFromVideo = res.data?.docs?.[0]?.owner;
          if (ownerFromVideo) {
            // We have a userId-based param — get full profile via username if possible
            channelData = ownerFromVideo;
            targetUserId = channelId;
          }
        } catch {
          // silently fall through
        }

        // If we didn't get channel data yet, try as username
        if (!channelData) {
          try {
            const profileRes = await channelService.getUserProfile(channelId);
            channelData = profileRes.data;
            targetUserId = profileRes.data?._id;
            setIsSubscribed(profileRes.data?.isSubscribed || false);
          } catch {
            setChannel(null);
            setLoading(false);
            return;
          }
        }
      }

      setChannel(channelData);

      if (!targetUserId) { setLoading(false); return; }

      // Load videos and playlists in parallel
      const [videoRes, playlistRes] = await Promise.allSettled([
        videoService.getAllVideos({
          userId: targetUserId,
          limit: 24,
          sortBy: 'createdAt',
          sortType: 'desc',
        }),
        playlistService.getUserPlaylists(targetUserId),
      ]);

      if (videoRes.status === 'fulfilled') {
        setVideos(videoRes.value.data?.docs || []);
      }
      if (playlistRes.status === 'fulfilled') {
        setPlaylists(playlistRes.value.data || []);
      }

      // Check subscription status if looking at another channel
      if (isAuthenticated && targetUserId !== user?._id) {
        try {
          const subRes = await subscriptionService.getChannelSubscribers(targetUserId);
          const subs = subRes.data || [];
          setIsSubscribed(subs.some((s) => s.subscriber?._id === user._id));
        } catch {
          // non-critical
        }
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
      toast.error('Failed to load channel');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!channel?._id) return;

    setSubLoading(true);
    try {
      await subscriptionService.toggleSubscription(channel._id);
      const nowSubscribed = !isSubscribed;
      setIsSubscribed(nowSubscribed);
      // Update local subscriber count on channel object
      setChannel((c) => ({
        ...c,
        subscribersCount: Math.max(0, (c.subscribersCount || 0) + (nowSubscribed ? 1 : -1)),
      }));
      toast.success(nowSubscribed ? 'Subscribed!' : 'Unsubscribed');
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription');
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
          description="This channel doesn't exist or has no public content"
        />
      </div>
    );
  }

  const isOwnChannel = channel._id === user?._id;
  const tabs = [
    { id: 'videos',    label: 'Videos',    count: videos.length },
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'about',     label: 'About' },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Banner */}
      {channel.coverImage && (
        <div className="w-full h-32 sm:h-48 overflow-hidden">
          <img
            src={channel.coverImage}
            alt="Channel cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

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
                <span>
                  {formatViews(channel.subscribersCount || 0)} subscribers
                </span>
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

      {/* Tab Content */}
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
              description={isOwnChannel ? 'Upload your first video to get started' : 'Check back later'}
            />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <ChannelVideoCard key={video._id} video={video} />
              ))}
            </div>
          )
        )}

        {activeTab === 'playlists' && (
          playlists.length === 0 ? (
            <EmptyState title="No playlists" description="No public playlists for this channel" />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((p) => (
                <Link key={p._id} to={`/playlists/${p._id}`} className="card-surface overflow-hidden group block">
                  <div className="aspect-video bg-youtube-hover flex items-center justify-center overflow-hidden">
                    {p.firstVideoThumbnail ? (
                      <img
                        src={p.firstVideoThumbnail}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
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
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="card-surface p-6 space-y-3 text-sm text-youtube-text-secondary">
              <h3 className="text-lg font-medium text-youtube-text">About</h3>
              <p>Channel: {channel.fullName}</p>
              {channel.subscribersCount !== undefined && (
                <p>{formatViews(channel.subscribersCount)} subscribers</p>
              )}
              {channel.createdAt && (
                <p>
                  Joined{' '}
                  {new Date(channel.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Minimal video card reused inside the channel grid
const ChannelVideoCard = ({ video }) => (
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

export default Channel;
