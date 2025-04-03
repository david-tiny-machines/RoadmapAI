import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    font-medium
    transition-all
    duration-150
    ease-in-out
    rounded-lg
    shadow-soft
    hover:shadow-soft-lg
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    active:transform
    active:scale-95
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:active:transform-none
  `;
  
  const variants = {
    primary: `
      bg-primary-600
      text-white
      hover:bg-primary-700
      focus:ring-primary-500
    `,
    secondary: `
      bg-gray-600
      text-white
      hover:bg-gray-700
      focus:ring-gray-500
    `,
    outline: `
      border-2
      border-primary-600
      text-primary-600
      hover:bg-primary-50
      focus:ring-primary-500
      bg-transparent
    `,
    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
      focus:ring-red-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'cursor-wait' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${loadingClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="w-5 h-5 mr-2 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 