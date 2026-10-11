'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  className = '',
  icon,
}) => {
  const variantClass = {
    indigo: 'badge-indigo',
    emerald: 'badge-emerald',
    amber: 'badge-amber',
    rose: 'badge-rose',
    slate: 'bg-secondary text-secondary-foreground border border-border text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5',
  }[variant];

  return (
    <span className={`${variantClass} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

