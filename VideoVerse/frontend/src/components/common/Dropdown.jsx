import { useEffect, useRef, useState } from 'react';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={rootRef} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>

      {open && (
        <div
          className={`absolute z-50 mt-2 ${width} ${alignClasses[align]} ${
            className ||
            'bg-youtube-surface border border-youtube-border rounded-lg shadow-2xl overflow-hidden animate-scale-in origin-top'
          }`}
        >
          {typeof children === 'function'
            ? children({ close: () => setOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;