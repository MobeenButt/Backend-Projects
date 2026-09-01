const Card = ({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-youtube-bg
        ${hover ? 'hover:bg-youtube-surface cursor-pointer transition-colors duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
