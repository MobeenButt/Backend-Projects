import { getInitials } from '../../utils/helpers';

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  fallback = '', 
  className = '' 
}) => {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = getInitials(fallback || alt || 'U');

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-primary flex items-center justify-center font-bold text-white">${initials}</div>`;
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-primary flex items-center justify-center font-bold text-white">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
