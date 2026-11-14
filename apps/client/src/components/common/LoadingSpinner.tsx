import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({
  size = 'md',
  message
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3" role="status" aria-live="polite">
      <div
        className={`${sizes[size]} rounded-full border-brand-500 border-t-transparent animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
