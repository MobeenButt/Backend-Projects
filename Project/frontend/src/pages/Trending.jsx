import { useState, useEffect } from 'react';
import { videoService } from '../services/video.service';
import { PageHeader, VideoGrid } from '../components/common/VideoPage';

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadTrendingVideos = async () => {
    setLoading(true);
    try {
      // Trending = most viewed, published
      const response = await videoService.getAllVideos({
        limit: 24,
        sortBy: 'views',
        sortType: 'desc',
      });
      setVideos(response.data?.docs || []);
    } catch (error) {
      console.error('Failed to load trending videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <PageHeader title="Trending" subtitle="Most watched videos right now" />
      <VideoGrid
        videos={videos}
        loading={loading}
        emptyIcon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        emptyTitle="No trending videos"
        emptyDescription="Check back later for trending content"
      />
    </div>
  );
};

export default Trending;