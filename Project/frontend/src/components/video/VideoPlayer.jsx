import { useEffect, useRef } from 'react';

const VideoPlayer = ({ src, poster, onEnded, onTimeUpdate }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => onEnded?.();
    const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onEnded, onTimeUpdate]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        className="w-full h-full"
        controlsList="nodownload"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
