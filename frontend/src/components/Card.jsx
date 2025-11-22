import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  gradient = false,
  ...props 
}) {
  const baseStyles = 'bg-white rounded-2xl shadow-card transition-all duration-300 border border-dark-100';
  const hoverStyles = hover ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : '';
  const glowStyles = glow ? 'shadow-glow hover:shadow-glow-lg' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white via-white to-primary-50/30' : '';
  
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
      className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-glass border border-white/20 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
