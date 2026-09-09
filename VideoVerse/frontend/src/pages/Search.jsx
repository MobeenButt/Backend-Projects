import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoService } from '../services/video.service';
import { VideoGrid } from '../components/common/VideoPage';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchVideos(query);
    } else {
      setVideos([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searchVideos = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await videoService.getAllVideos({
        query: searchQuery,
        limit: 24,
        sortBy: 'createdAt',
        sortType: 'desc',
      });
      setVideos(response.data?.docs || []);
    } catch (error) {
      console.error('Failed to search videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <h1 className="text-xl text-youtube-text-secondary mb-6">
        Search results for:{' '}
        <span className="text-youtube-text font-medium">"{query}"</span>
        {!loading && (
          <span className="ml-2 text-sm">• {videos.length} results</span>
        )}
      </h1>

      <VideoGrid
        videos={videos}
        loading={loading}
        emptyIcon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        emptyTitle="No results found"
        emptyDescription="Try different keywords or check your spelling"
      />
    </div>
  );
};

export default Search;