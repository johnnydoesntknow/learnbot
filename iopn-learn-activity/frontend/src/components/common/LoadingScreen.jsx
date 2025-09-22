// frontend/src/components/common/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f112a] via-[#1d2449] to-[#5305b6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6105b6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-[#f8f6f1] mb-2">
          Connecting to Discord
        </h2>
        <p className="text-[#f8f6f1]/60">
          Preparing your learning experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;