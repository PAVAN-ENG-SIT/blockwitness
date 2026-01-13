import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  gradient = false,
  ...props 
}) {
  const baseStyles = 'bg-dark-800/90 rounded-2xl shadow-lg transition-all duration-500 border border-dark-700/50 backdrop-blur-sm animate-fade-in-up';
  const hoverStyles = hover ? 'hover:shadow-glow hover:-translate-y-2 hover:border-primary-600/50 cursor-pointer card-interactive' : '';
  const glowStyles = glow ? 'shadow-glow hover:shadow-glow-lg' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-dark-800 via-dark-800 to-primary-900/20 border-primary-700/30' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${glowStyles} ${gradientStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`glass rounded-2xl shadow-lg transition-all duration-500 hover:border-primary-600/30 animate-fade-in-up ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
