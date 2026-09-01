import { useState, useEffect } from 'react';
import { videoService } from '../services/video.service';
import VideoCard from '../components/video/VideoCard';
import Loader from '../components/common/Loader';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'recent', label: 'Latest', sortBy: 'createdAt', sortType: 'desc' },
    { id: 'popular', label: 'Popular', sortBy: 'views', sortType: 'desc' },
  ];

  useEffect(() => {
    loadVideos();
  }, [filter]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const currentFilter = filters.find(f => f.id === filter);
      const params = currentFilter?.sortBy ? {
        sortBy: currentFilter.sortBy,
        sortType: currentFilter.sortType,
        limit: 24
      } : { limit: 24 };

      const response = await videoService.getAllVideos(params);
      setVideos(response.data.docs || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Filters */}
      <div className="sticky top-14 bg-youtube-bg border-b border-youtube-border z-10 py-3 px-4 lg:px-6">
        <div className="flex gap-3 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${filter === f.id
                  ? 'bg-white text-black'
                  : 'bg-youtube-surface text-youtube-text hover:bg-youtube-hover'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-4 lg:px-6 pt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-youtube-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-youtube-text mb-2">No videos found</h3>
            <p className="text-sm text-youtube-text-secondary">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
