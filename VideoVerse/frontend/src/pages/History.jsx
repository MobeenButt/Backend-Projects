import { useState, useEffect } from 'react';
import { channelService } from '../services/channel.service';
import Button from '../components/common/Button';
import { PageHeader, VideoGrid } from '../components/common/VideoPage';
import toast from 'react-hot-toast';

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await channelService.getWatchHistory();
      setVideos(response.data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all watch history?')) return;
    try {
      await channelService.clearWatchHistory();
      setVideos([]);
      toast.success('Watch history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <PageHeader
        title="Watch History"
        subtitle={`${videos.length} ${videos.length === 1 ? 'video' : 'videos'}`}
        action={
          videos.length > 0 && (
            <Button variant="outlined" size="sm" onClick={handleClearHistory}>
              Clear history
            </Button>
          )
        }
      />
      <VideoGrid
        videos={videos}
        loading={loading}
        emptyIcon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        emptyTitle="No watch history"
        emptyDescription="Videos you watch will appear here"
      />
    </div>
  );
};

export default History;