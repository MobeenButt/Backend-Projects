import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoService } from '../services/video.service';
import { channelService } from '../services/channel.service';
import useAuthStore from '../store/useAuthStore';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/video/CommentSection';
import VideoCard from '../components/video/VideoCard';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatViews, formatTimeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const Watch = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (videoId) {
      loadVideo();
      loadRelatedVideos();
      incrementView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const loadVideo = async () => {
    setLoading(true);
    try {
      const response = await videoService.getVideoById(videoId);
      setVideo(response.data);
    } catch (error) {
      console.error('Failed to load video:', error);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedVideos = async () => {
    try {
      const response = await videoService.getAllVideos({ limit: 12, sortBy: 'views', sortType: 'desc' });
      setRelatedVideos(response.data?.docs || []);
    } catch (error) {
      console.error('Failed to load related videos:', error);
    }
  };

  const incrementView = async () => {
    try {
      await videoService.incrementViews(videoId);
    } catch (error) {
      // Non-critical, ignore
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like videos');
      return;
    }
    try {
      await videoService.likeVideo(videoId);
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setVideo((v) => ({
        ...v,
        likesCount: Math.max(0, (v.likesCount || 0) + (newLikedState ? 1 : -1)),
      }));
      toast.success(newLikedState ? 'Added to liked videos' : 'Removed from liked videos');
    } catch (error) {
      toast.error('Failed to like video');
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      return;
    }
    try {
      await channelService.subscribe(video.owner._id);
      const newSubState = !isSubscribed;
      setIsSubscribed(newSubState);
      toast.success(newSubState ? 'Subscribed!' : 'Unsubscribed');
    } catch (error) {
      toast.error('Failed to subscribe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h2 className="text-xl font-medium text-youtube-text mb-2">Video not found</h2>
          <p className="text-sm text-youtube-text-secondary">The video you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-screen-2xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-5xl min-w-0">
          {/* Video Player */}
          <VideoPlayer src={video.videoFile} poster={video.thumbnail} />

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-lg md:text-xl font-medium text-youtube-text mb-3 line-clamp-2">
              {video.title}
            </h1>

            {/* Channel Info & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link to={`/channel/${video.owner._id}`} className="flex-shrink-0">
                  <Avatar
                    src={video.owner?.avatar}
                    alt={video.owner?.fullName}
                    fallback={video.owner?.fullName}
                    size="md"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/channel/${video.owner._id}`}
                    className="font-medium text-youtube-text hover:text-youtube-text-secondary block text-sm truncate"
                  >
                    {video.owner?.fullName}
                  </Link>
                  <p className="text-xs text-youtube-text-secondary">
                    {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={isLiked ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleLike}
                  aria-pressed={isLiked}
                >
                  <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {video.likesCount || 0}
                </Button>

                <Button
                  variant={isSubscribed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleSubscribe}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 card-surface p-3.5 hover:bg-youtube-hover/40 transition-colors">
              <p className={`text-sm text-youtube-text whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                {video.description || 'No description provided.'}
              </p>
              {video.description?.length > 100 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm font-medium text-youtube-text-secondary hover:text-youtube-text mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <CommentSection videoId={videoId} />
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="lg:w-96 xl:w-[400px] flex-shrink-0">
          <div className="space-y-3">
            {relatedVideos
              .filter((rv) => rv._id !== videoId)
              .map((relatedVideo) => (
                <VideoCard key={relatedVideo._id} video={relatedVideo} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;