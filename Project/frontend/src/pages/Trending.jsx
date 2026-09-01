import { useState, useEffect } from 'react';
import VideoCard from '../components/video/VideoCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadTrendingVideos = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get trending videos
      // const data = await videoService.getTrendingVideos();
      // setVideos(data);
      
      // Temporary: Show empty state
      setVideos([]);
    } catch (error) {
      toast.error('Failed to load trending videos');
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

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-xl font-medium text-youtube-text mb-2">No trending videos</h2>
          <p className="text-youtube-text-secondary">Check back later for trending content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-youtube-text mb-6">Trending</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Trending;
