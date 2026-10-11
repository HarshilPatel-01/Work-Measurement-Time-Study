'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', gradient = false }) => {
  return (
    <div className={`${gradient ? 'card-gradient' : 'card-premium'} p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="font-heading font-bold text-lg text-foreground tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

