import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg bg-white p-4 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
