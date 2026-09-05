const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  hint,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-youtube-text mb-1.5">
          {label} {required && <span className="text-youtube-red">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-youtube-text-secondary pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-field
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-youtube-red focus:border-youtube-red focus:ring-youtube-red/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-youtube-red">{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-xs text-youtube-text-secondary">{hint}</p>
      )}
    </div>
  );
};

export default Input;