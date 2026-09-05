import { useState, useEffect } from 'react';
import { videoService } from '../services/video.service';
import VideoCard from '../components/video/VideoCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const currentFilter = filters.find((f) => f.id === filter);
      const params = currentFilter?.sortBy
        ? { sortBy: currentFilter.sortBy, sortType: currentFilter.sortType, limit: 24 }
        : { limit: 24, sortBy: 'createdAt', sortType: 'desc' };
      const response = await videoService.getAllVideos(params);
      setVideos(response.data?.docs || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Filters */}
      <div className="sticky top-14 bg-youtube-bg/95 backdrop-blur-sm border-b border-youtube-border z-10 py-2.5 px-4 lg:px-6">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`chip ${filter === f.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-4 lg:px-6 pt-6">
        {loading ? (
          <SkeletonGrid count={12} />
        ) : videos.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            title="No videos found"
            description="Check back later for new content"
          />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 animate-fade-in">
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