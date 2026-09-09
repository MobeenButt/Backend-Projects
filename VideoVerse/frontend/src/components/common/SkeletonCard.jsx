const SkeletonCard = () => {
  return (
    <div className="flex flex-col w-full animate-pulse">
      <div className="w-full aspect-video bg-youtube-surface/60 rounded-xl mb-3" />
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-youtube-surface/60 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3.5 bg-youtube-surface/60 rounded w-full" />
          <div className="h-3.5 bg-youtube-surface/60 rounded w-2/3" />
          <div className="h-2.5 bg-youtube-surface/40 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;