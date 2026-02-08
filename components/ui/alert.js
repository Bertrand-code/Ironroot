import React from 'react';

const variantStyles = {
  default: 'alert',
  destructive: 'alert',
};

export function Alert({ variant = 'default', className = '', ...props }) {
  const variantClass = variantStyles[variant] || variantStyles.default;
  return <div className={`${variantClass} ${className}`.trim()} {...props} />;
}

export function AlertDescription({ className = '', ...props }) {
  return <div className={className} {...props} />;
}
