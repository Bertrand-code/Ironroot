import React from 'react';

const variantStyles = {
  primary: 'btn--primary',
  outline: 'btn--ghost',
  ghost: 'btn--ghost',
  secondary: 'btn--secondary',
};

const sizeStyles = {
  sm: 'btn--sm',
  md: '',
  lg: 'btn--lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const variantClass = variantStyles[variant] || variantStyles.primary;
  const sizeClass = sizeStyles[size] || '';
  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    />
  );
}
