import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  className = '',
  onChange,
  ...props
}) => {
  const selectClasses = `
    block
    w-full
    px-4
    py-3
    text-base
    transition
    duration-150
    ease-in-out
    rounded-lg
    shadow-soft
    bg-white
    focus:outline-none
    focus:ring-2
    focus:ring-primary-500/20
    focus:border-primary-500
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-primary-500'
    }
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const labelClasses = `
    block
    mb-2
    text-sm
    font-medium
    transition-colors
    ${error ? 'text-red-600' : 'text-gray-700'}
  `;

  const messageClasses = `
    mt-2
    text-sm
    ${error ? 'text-red-600' : 'text-gray-500'}
  `;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} group`}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={selectClasses}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg
            className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p 
          className={messageClasses}
          id={error ? `${props.id}-error` : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select; 