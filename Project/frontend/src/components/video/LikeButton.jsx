import { useState } from 'react';
import { likeService } from '../../services/like.service';
import toast from 'react-hot-toast';

const LikeButton = ({ videoId, initialLikesCount = 0, initialIsLiked = false, type = 'video' }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    try {
      setIsLoading(true);
      
      let response;
      if (type === 'video') {
        response = await likeService.toggleVideoLike(videoId);
      } else if (type === 'comment') {
        response = await likeService.toggleCommentLike(videoId);
      } else if (type === 'tweet') {
        response = await likeService.toggleTweetLike(videoId);
      }

      // Toggle state
      const newIsLiked = response.data.isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all
        ${isLiked 
          ? 'bg-youtube-red/10 text-youtube-red hover:bg-youtube-red/20' 
          : 'bg-youtube-surface text-youtube-text hover:bg-youtube-hover'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <svg
        className={`w-5 h-5 transition-transform ${isLiked ? 'scale-110' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
      <span>{likesCount}</span>
    </button>
  );
};

export default LikeButton;
