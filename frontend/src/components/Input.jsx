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
    <div className={`space-y-2 ${containerClassName} ${!label && !error ? className : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-12' : ''}
            bg-white border-2 border-dark-200
            rounded-xl text-dark-900 placeholder:text-dark-400
            transition-all duration-200
            focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
            focus:outline-none
            hover:border-dark-300
            disabled:bg-dark-50 disabled:cursor-not-allowed
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
            ${label || error ? className : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-danger-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
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
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName} ${!label && !error ? className : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3
          bg-white border-2 border-dark-200
          rounded-xl text-dark-900 placeholder:text-dark-400
          transition-all duration-200
          focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
          focus:outline-none
          hover:border-dark-300
          disabled:bg-dark-50 disabled:cursor-not-allowed
          resize-none
          ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
          ${label || error ? className : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
