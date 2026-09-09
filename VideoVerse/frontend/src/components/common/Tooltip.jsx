import { useState, useRef } from 'react';

const Tooltip = ({ content, children, position = 'bottom', disabled = false }) => {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-youtube-surface',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-youtube-surface',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-youtube-surface',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-youtube-surface',
  };

  const show = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
      setHovering(true);
    }, 400);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setHovering(false);
  };

  if (disabled) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className={`absolute z-50 ${positions[position]}`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={hide}
        >
          {hovering && (
            <>
              <span
                className={`absolute w-2 h-2 rotate-45 bg-youtube-surface ${arrows[position]}`}
              />
              <span className="relative bg-youtube-surface text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
                {content}
              </span>
            </>
          )}
        </span>
      )}
    </span>
  );
};

export default Tooltip;