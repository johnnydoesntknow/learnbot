// frontend/src/components/common/ErrorScreen.jsx
import React from 'react';

const ErrorScreen = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f112a] via-[#1d2449] to-[#5305b6] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h2 className="text-2xl font-bold text-[#f8f6f1] mb-3">
          Connection Error
        </h2>
        
        <p className="text-[#f8f6f1]/70 mb-6">
          {message || 'Something went wrong. Please try again.'}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-[#6105b6] to-[#6305b6] rounded-lg text-[#f8f6f1] font-semibold hover:scale-105 transition-transform"
          >
            Try Again
          </button>
        )}
        
        <div className="mt-6 p-4 bg-[#1d2449]/30 rounded-lg">
          <p className="text-sm text-[#f8f6f1]/60">
            Make sure you're launching this from Discord using the /learn command
          </p>
        </div>
      </div>
    </div>
  );
};

export { ErrorScreen };