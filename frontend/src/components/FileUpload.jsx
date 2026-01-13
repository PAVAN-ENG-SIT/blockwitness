import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function FileUpload({ 
  label = 'Upload Files',
  accept,
  multiple = false,
  onChange,
  maxSize,
  className = '',
  value = null
}) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      setFiles([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [value]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    setFiles(filesArray);
    if (onChange) {
      onChange({ target: { files: fileList } });
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    const event = {
      target: {
        files: dt.files,
        value: ''
      }
    };
    if (onChange) {
      onChange(event);
    }
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div className={`space-y-3 animate-fade-in-up ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-dark-200 mb-2">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-all duration-500 cursor-pointer
          ${dragActive 
            ? 'border-neon-cyan bg-dark-800/80 scale-105 shadow-glow backdrop-blur-sm' 
            : 'border-dark-700 hover:border-primary-600 hover:bg-dark-800/50 hover:scale-[1.02] backdrop-blur-sm'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow animate-float">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-dark-100">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-dark-400 mt-1">
              {multiple ? 'Upload multiple files' : 'Upload a single file'}
              {maxSize && ` (max ${maxSize}MB)`}
            </p>
          </div>
          
          <Button variant="ghost" size="sm" type="button">
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-sm font-semibold text-dark-200">
            Selected Files ({files.length})
          </p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-dark-800/70 rounded-xl border border-dark-700/50 group hover:border-primary-600 hover:shadow-glow transition-all duration-300 animate-slide-up backdrop-blur-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-glow transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">{file.name}</p>
                  <p className="text-xs text-dark-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                className="ml-3 p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
