import React from 'react';

const variantStyles = {
  default: 'badge',
  outline: 'badge badge--warning',
};

export function Badge({ variant = 'default', className = '', ...props }) {
  const variantClass = variantStyles[variant] || variantStyles.default;
  return <span className={`${variantClass} ${className}`.trim()} {...props} />;
}
