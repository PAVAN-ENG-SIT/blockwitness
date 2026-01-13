import React from 'react';

export default function Input({ 
  label, 
  error, 
  icon,
  className = '',
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`animate-fade-in-up ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-dark-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 group-focus-within:text-primary-500 transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5
            bg-dark-800/70 backdrop-blur-sm
            border-2 border-dark-700/50
            text-dark-100 placeholder-dark-500
            rounded-xl
            transition-all duration-300
            focus:outline-none
            focus:border-primary-500
            focus:shadow-glow
            focus:bg-dark-800
            hover:border-dark-600/80
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
            ${className}
          `}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-secondary-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 animate-slide-down flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  rows = 4,
  ...props 
}) {
  return (
    <div className={`animate-fade-in-up ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-dark-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        <textarea
          rows={rows}
          className={`
            w-full px-4 py-3.5
            bg-dark-800/70 backdrop-blur-sm
            border-2 border-dark-700/50
            text-dark-100 placeholder-dark-500
            rounded-xl
            transition-all duration-300
            focus:outline-none
            focus:border-primary-500
            focus:shadow-glow
            focus:bg-dark-800
            hover:border-dark-600/80
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
            ${className}
          `}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-secondary-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 animate-slide-down flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
