import React from 'react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-2xl p-8 bg-[#1A202C]/80 backdrop-blur-sm border border-gray-700 rounded-xl">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-600 h-16 w-16 mb-6 animate-spin border-t-amber-500"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Production in Progress...</h2>
      <p className="text-gray-400">This can take a few minutes. Please don't close this window.</p>
      <div className="mt-6 text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg">
        <p>{message}</p>
      </div>
    </div>
  );
};