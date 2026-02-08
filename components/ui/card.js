import React from 'react';

export function Card({ className = '', ...props }) {
  return <div className={`card ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = '', ...props }) {
  return <div className={`card__header ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  return <h3 className={`card__title ${className}`.trim()} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={`card__content ${className}`.trim()} {...props} />;
}
