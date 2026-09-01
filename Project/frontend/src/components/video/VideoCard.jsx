import { Link } from 'react-router-dom';
import { formatViews, formatDuration, formatTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';

const VideoCard = ({ video }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Thumbnail */}
      <Link to={`/watch/${video._id}`} className="relative w-full aspect-video bg-youtube-surface rounded-lg overflow-hidden mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </div>
        )}
      </Link>

      {/* Video Info */}
      <div className="flex gap-3">
        <Link to={`/channel/${video.owner?._id}`} className="flex-shrink-0">
          <Avatar
            src={video.owner?.avatar}
            alt={video.owner?.fullName}
            fallback={video.owner?.fullName || 'User'}
            size="sm"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-sm font-medium text-youtube-text line-clamp-2 mb-1 leading-snug">
              {video.title}
            </h3>
          </Link>

          <Link
            to={`/channel/${video.owner?._id}`}
            className="text-xs text-youtube-text-secondary hover:text-youtube-text block mb-0.5"
          >
            {video.owner?.fullName}
          </Link>

          <div className="flex items-center text-xs text-youtube-text-secondary">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
