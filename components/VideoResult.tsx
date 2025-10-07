import React, { useState } from 'react';
import { DownloadIcon, NewVideoIcon, HistoryIcon } from './icons';

interface VideoResultProps {
  videoUrl: string;
  onNewGeneration: () => void;
  onShowHistory: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, onNewGeneration, onShowHistory }) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleNewProductionClick = () => {
    setIsResetting(true);
    // Simulate a short delay to show loading, then reset
    setTimeout(() => {
        onNewGeneration();
        // No need to set isResetting to false as the component will unmount
    }, 500);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center p-4">
      <div className="w-full bg-[#1A202C]/80 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-2 text-white">Production Complete!</h2>
          <p className="text-gray-400 mb-6">Your video is ready for showtime.</p>
          
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-amber-500/50 shadow-2xl shadow-amber-900/40 mb-8">
            <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain" 
                key={videoUrl}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <a
              href={videoUrl}
              download="ai-video-forge.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <DownloadIcon className="h-6 w-6" />
              Download
            </a>
            <button
              onClick={handleNewProductionClick}
              disabled={isResetting}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isResetting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <NewVideoIcon className="h-6 w-6" />
                  New Production
                </>
              )}
            </button>
             <button
              onClick={onShowHistory}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <HistoryIcon className="h-6 w-6" />
              View History
            </button>
          </div>
      </div>
    </div>
  );
};
