const Loader = ({ size = 'md', fullScreen = false, text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-youtube-border border-t-youtube-red rounded-full animate-spin`}
    />
  );

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {text && <p className="text-youtube-text-secondary text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-youtube-bg/95 flex items-center justify-center z-50 animate-fade-in">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;