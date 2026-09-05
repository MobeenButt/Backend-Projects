import { Link } from 'react-router-dom';
import { formatViews, formatDuration, formatTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';

const VideoCard = ({ video }) => {
  return (
    <div className="flex flex-col w-full group">
      {/* Thumbnail */}
      <Link
        to={`/watch/${video._id}`}
        className="relative w-full aspect-video bg-youtube-surface rounded-xl overflow-hidden mb-3 block"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded-md text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </div>
        )}
      </Link>

      {/* Video Info */}
      <div className="flex gap-3">
        <Link to={`/channel/${video.owner?._id}`} className="flex-shrink-0 mt-0.5">
          <Avatar
            src={video.owner?.avatar}
            alt={video.owner?.fullName}
            fallback={video.owner?.fullName || 'User'}
            size="sm"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-sm font-medium text-youtube-text line-clamp-2 mb-1 leading-snug group-hover:text-youtube-text/90 transition-colors">
              {video.title}
            </h3>
          </Link>

          <Link
            to={`/channel/${video.owner?._id}`}
            className="text-xs text-youtube-text-secondary hover:text-youtube-text block mb-0.5 w-fit transition-colors"
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