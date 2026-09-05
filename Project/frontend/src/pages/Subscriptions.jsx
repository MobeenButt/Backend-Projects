import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../services/subscription.service';
import { videoService } from '../services/video.service';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/common/Avatar';
import { PageHeader, VideoGrid } from '../components/common/VideoPage';

const Subscriptions = () => {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  }, [user?._id]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const channelResponse = await subscriptionService.getSubscribedChannels(user._id);
      const subs = channelResponse.data || [];
      setChannels(subs);

      const channelIds = subs.map((s) => s.channel?._id).filter(Boolean);
      const videosPromises = channelIds.map((id) =>
        videoService.getAllVideos({ userId: id, limit: 10, sortBy: 'createdAt', sortType: 'desc' })
      );
      const results = await Promise.all(videosPromises);
      const allVideos = results.flatMap((r) => r.data?.docs || []);
      // Deduplicate by id
      const uniqueVideos = allVideos.filter(
        (v, i, arr) => arr.findIndex((x) => x._id === v._id) === i
      );
      setVideos(uniqueVideos);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      setVideos([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-youtube-border border-t-youtube-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <PageHeader title="Subscriptions" subtitle="Latest videos from channels you follow" />

      {channels.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-1">
          {channels.map((sub) => (
            <Link
              key={sub.channel?._id}
              to={`/channel/${sub.channel?._id}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-br from-green-400 to-blue-500 group-hover:from-green-300 group-hover:to-blue-400 transition-all">
                <Avatar
                  src={sub.channel?.avatar}
                  alt={sub.channel?.fullName}
                  fallback={sub.channel?.fullName}
                  size="lg"
                  className="border-2 border-youtube-bg"
                />
              </div>
              <span className="text-xs text-youtube-text max-w-20 truncate text-center group-hover:text-youtube-text-secondary transition-colors">
                {sub.channel?.fullName}
              </span>
            </Link>
          ))}
        </div>
      )}

      <VideoGrid
        videos={videos}
        loading={loading}
        emptyIcon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        emptyTitle="No subscriptions yet"
        emptyDescription="Subscribe to channels to see their latest videos here"
      />
    </div>
  );
};

export default Subscriptions;