import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import VideoCard from '../components/video/VideoCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

const Channel = () => {
  const { channelId } = useParams();
  const { user } = useAuthStore();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get channel data
      // If no channelId, show current user's channel
      // const data = await channelService.getChannel(channelId || user._id);
      // setChannel(data);
      // setVideos(data.videos);
      
      // Temporary: Use current user data
      setChannel(user);
      setVideos([]);
    } catch (error) {
      toast.error('Failed to load channel');
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

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-youtube-text mb-2">Channel not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Channel Header */}
      <div className="bg-youtube-surface border-b border-youtube-border">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-start gap-6">
            <Avatar 
              src={channel.avatar} 
              alt={channel.fullName}
              size="xl"
              fallback={channel.fullName}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-youtube-text mb-1">{channel.fullName}</h1>
              <div className="flex items-center gap-4 text-sm text-youtube-text-secondary mb-3">
                <span>@{channel.username}</span>
                <span>0 subscribers</span>
                <span>{videos.length} videos</span>
              </div>
              {channel._id !== user?._id && (
                <Button variant="primary">Subscribe</Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 border-b border-youtube-border">
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'videos'
                  ? 'text-youtube-text'
                  : 'text-youtube-text-secondary hover:text-youtube-text'
              }`}
            >
              Videos
              {activeTab === 'videos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-youtube-text"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'playlists'
                  ? 'text-youtube-text'
                  : 'text-youtube-text-secondary hover:text-youtube-text'
              }`}
            >
              Playlists
              {activeTab === 'playlists' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-youtube-text"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'about'
                  ? 'text-youtube-text'
                  : 'text-youtube-text-secondary hover:text-youtube-text'
              }`}
            >
              About
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-youtube-text"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto mb-4 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-medium text-youtube-text mb-2">No videos yet</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )
        )}

        {activeTab === 'playlists' && (
          <div className="text-center py-12">
            <p className="text-youtube-text-secondary">No playlists available</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="bg-youtube-surface border border-youtube-border rounded-sm p-6">
              <h3 className="text-lg font-medium text-youtube-text mb-4">About</h3>
              <div className="space-y-3 text-sm text-youtube-text-secondary">
                <p>Email: {channel.email}</p>
                <p>Joined: {new Date(channel.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
