import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
  variant?: 'default' | 'hover';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  noPadding = false,
  variant = 'default',
}) => {
  const baseStyles = `
    bg-white
    rounded-xl
    border
    border-gray-200
    transition-all
    duration-200
    ${variant === 'hover' ? 'hover:shadow-soft-lg' : 'shadow-soft'}
  `;

  const headerClasses = `
    px-6
    py-5
    border-b
    border-gray-200
    ${variant === 'hover' ? 'group-hover:border-gray-300' : ''}
  `;

  const bodyClasses = `
    ${noPadding ? '' : 'px-6 py-5'}
  `;

  const footerClasses = `
    px-6
    py-4
    border-t
    border-gray-200
    ${variant === 'hover' ? 'group-hover:border-gray-300' : ''}
  `;

  return (
    <div className={`${baseStyles} ${className} group`}>
      {(title || subtitle) && (
        <div className={headerClasses}>
          {title && (
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={bodyClasses}>
        {children}
      </div>
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 