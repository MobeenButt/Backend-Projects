import { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ src, poster, onEnded, onTimeUpdate, className = '' }) => {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => onEnded?.();
    const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);
    const handleLoaded = () => setReady(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoaded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoaded);
      setReady(false);
    };
  }, [onEnded, onTimeUpdate, src]);

  return (
    <div
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        preload="metadata"
        className="w-full h-full"
        controlsList="nodownload"
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading indicator */}
      {!ready && src && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <div className="w-12 h-12 border-4 border-youtube-border border-t-youtube-red rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;