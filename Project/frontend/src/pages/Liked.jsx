import { useState, useEffect } from 'react';
import { likeService } from '../services/like.service';
import { PageHeader, VideoGrid } from '../components/common/VideoPage';

const Liked = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedVideos();
  }, []);

  const loadLikedVideos = async () => {
    setLoading(true);
    try {
      const response = await likeService.getLikedVideos();
      // Response shape: [{ video, createdAt }]
      const likedVideos = (response.data || []).map((l) => l.video).filter(Boolean);
      setVideos(likedVideos);
    } catch (error) {
      console.error('Failed to load liked videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <PageHeader title="Liked Videos" subtitle="Videos you've liked" />
      <VideoGrid
        videos={videos}
        loading={loading}
        emptyIcon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        }
        emptyTitle="No liked videos yet"
        emptyDescription="Tap the like button on a video to save it here"
      />
    </div>
  );
};

export default Liked;