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
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:scale-105 active:scale-95',
    success: 'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-lg shadow-success-500/30 hover:shadow-xl hover:shadow-success-500/40 hover:scale-105 active:scale-95',
    ghost: 'bg-dark-100/50 hover:bg-dark-200/70 text-dark-700 backdrop-blur-sm border border-dark-200 hover:border-dark-300 hover:scale-105 active:scale-95',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-danger-600 to-danger-500 text-white shadow-lg shadow-danger-500/30 hover:shadow-xl hover:shadow-danger-500/40 hover:scale-105 active:scale-95',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
