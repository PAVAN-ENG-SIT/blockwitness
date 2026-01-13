import React from 'react';

export default function Badge({ children, variant = 'primary', size = 'md', className = '' }) {
  const variants = {
    primary: 'bg-primary-600/20 text-primary-300 border-primary-600/30',
    success: 'bg-success-600/20 text-success-300 border-success-600/30',
    warning: 'bg-warning-600/20 text-warning-300 border-warning-600/30',
    danger: 'bg-red-600/20 text-red-300 border-red-600/30',
    dark: 'bg-dark-700/50 text-dark-200 border-dark-600/50',
    accent: 'bg-accent-600/20 text-accent-300 border-accent-600/30',
    neon: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 shadow-glow',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border backdrop-blur-sm transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
