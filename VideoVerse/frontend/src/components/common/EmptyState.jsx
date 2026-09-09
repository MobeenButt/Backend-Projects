const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-20 h-20 bg-youtube-surface rounded-full flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-youtube-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-youtube-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;