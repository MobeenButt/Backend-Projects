import { useState } from 'react';
import { getInitials } from '../../utils/helpers';

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  fallback = '',
  className = '',
}) => {
  const [showFallback, setShowFallback] = useState(false);

  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const initials = getInitials(fallback || alt || 'U');

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {src && !showFallback ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setShowFallback(true)}
        />
      ) : (
        <div className="w-full h-full avatar-gradient flex items-center justify-center font-medium text-white">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;