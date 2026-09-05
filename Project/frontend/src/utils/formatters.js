// Format view count (e.g., 1234 -> 1.2K, 1234567 -> 1.2M)
export const formatViews = (views) => {
  if (!views) return '0 views';
  
  if (views < 1000) {
    return `${views} views`;
  } else if (views < 1000000) {
    return `${(views / 1000).toFixed(1)}K views`;
  } else if (views < 1000000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else {
    return `${(views / 1000000000).toFixed(1)}B views`;
  }
};

// Format duration (seconds to MM:SS or HH:MM:SS)
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Format date to "X time ago"
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const uploadDate = new Date(date);
  const diffInSeconds = Math.floor((now - uploadDate) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

// Format date to readable format
export const formatDate = (date) => {
  if (!date) return '';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format subscriber count
export const formatSubscribers = (count) => {
  if (!count) return '0 subscribers';
  
  if (count < 1000) {
    return `${count} subscribers`;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K subscribers`;
  } else {
    return `${(count / 1000000).toFixed(1)}M subscribers`;
  }
};
