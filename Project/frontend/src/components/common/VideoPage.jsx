import VideoCard from '../video/VideoCard';
import { SkeletonGrid } from '../common/SkeletonCard';
import EmptyState from '../common/EmptyState';

export const VideoGrid = ({ videos, loading, emptyIcon, emptyTitle, emptyDescription, emptyAction }) => {
  if (loading) return <SkeletonGrid count={12} />;

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 animate-fade-in">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 className="text-2xl font-bold text-youtube-text tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-youtube-text-secondary mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default { VideoGrid, PageHeader };