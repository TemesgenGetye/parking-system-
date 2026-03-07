import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Accent background (e.g. for featured stats) */
  variant?: 'default' | 'accent';
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const base = 'rounded-2xl p-5 shadow-sm';
  const styles = variant === 'accent'
    ? `${base} bg-red-600 text-white`
    : `${base} bg-white ring-1 ring-gray-200/50`;
  return (
    <div className={`${styles} ${className}`}>
      {children}
    </div>
  );
}
