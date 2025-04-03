import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const inputClasses = `
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
    focus:outline-none
    focus:ring-2
    focus:ring-primary-500/20
    focus:border-primary-500
    ${error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20' 
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

  return (
    <div className={`${fullWidth ? 'w-full' : ''} group`}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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

export default Input; 