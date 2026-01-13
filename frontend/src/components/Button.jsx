import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group btn-ripple';
  
  const variants = {
    primary: 'bg-gradient-primary text-white shadow-button hover:shadow-button-hover hover:scale-105 active:scale-95 hover:brightness-110',
    secondary: 'bg-gradient-secondary text-white shadow-glow-secondary hover:shadow-glow-secondary hover:scale-105 active:scale-95 hover:brightness-110',
    accent: 'bg-gradient-accent text-white shadow-glow-accent hover:shadow-glow-accent hover:scale-105 active:scale-95 hover:brightness-110',
    success: 'bg-gradient-success text-white shadow-glow-success hover:shadow-glow-success hover:scale-105 active:scale-95 hover:brightness-110',
    ghost: 'bg-dark-800/50 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-secondary-500/10 text-dark-200 backdrop-blur-sm border border-dark-700 hover:border-primary-400 hover:scale-105 active:scale-95',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-900/20 hover:border-primary-600 hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 hover:brightness-110',
  };
  
  const sizes = {
    sm: 'px-5 py-2.5 text-sm gap-2',
    md: 'px-7 py-3.5 text-base gap-2.5',
    lg: 'px-9 py-4.5 text-lg gap-3',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
