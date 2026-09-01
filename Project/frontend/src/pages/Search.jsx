import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/video/VideoCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchVideos(query);
    }
  }, [query]);

  const searchVideos = async (searchQuery) => {
    try {
      setLoading(true);
      // TODO: Implement API call to search videos
      // const data = await videoService.searchVideos(searchQuery);
      // setVideos(data);
      
      // Temporary: Show empty state
      setVideos([]);
    } catch (error) {
      toast.error('Failed to search videos');
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

  return (
    <div className="p-6">
      <h1 className="text-xl text-youtube-text-secondary mb-6">
        Search results for: <span className="text-youtube-text font-medium">"{query}"</span>
      </h1>
      
      {videos.length === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-medium text-youtube-text mb-2">No results found</h2>
            <p className="text-youtube-text-secondary">Try different keywords or check your spelling</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
