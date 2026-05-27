import React, { type ReactNode } from 'react';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  paddingClassName?: string;
  style?: React.CSSProperties;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  padding = 'md',
  paddingClassName,
  style
}) => {
  const getPaddingClass = () => {
    if (paddingClassName) return paddingClassName;
    switch (padding) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-5';
      default: return 'p-4';
    }
  };

  const baseClasses = 'bg-app-surface rounded-[20px] border border-app-border';
  const paddingClasses = getPaddingClass();
  const interactableClasses = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : '';

  return (
    <div 
      className={`${baseClasses} ${paddingClasses} ${interactableClasses} ${className}`.trim()}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
