
import React, { useState } from 'react';
import { GenerateIcon, InfoIcon, RefreshIcon } from './icons';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}

const suggestions = [
    "Want toned abs? Try this...",
    "Save $1000 in 30 days - financial tip",
    "The greatest of all - financial advice",
    "A cinematic shot of a futuristic city at dusk",
    "Time-lapse of a flower blooming, vibrant colors",
    "A cute animated robot waving hello",
    "Breathtaking drone shot of a tropical island",
    "A dramatic historical scene from ancient Rome",
    "Explainer video about black holes in a simple way"
];

const getRandomSuggestions = () => {
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

const TabButton: React.FC<{label: string, name: string, activeTab: string, setActiveTab: (name: string) => void}> = ({ label, name, activeTab, setActiveTab }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
        activeTab === name
          ? 'text-amber-400'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
      {activeTab === name && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
      )}
    </button>
);

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, onGenerate }) => {
  const [activeTab, setActiveTab] = useState('prompt');
  const [isQuickPace, setIsQuickPace] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState(getRandomSuggestions);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        onGenerate();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-[#1A202C] border border-gray-700 rounded-xl text-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-900/50">
            <TabButton label="Generate from prompt" name="prompt" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton label="Use my content" name="content" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Text Area */}
        <div className="p-4">
             <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type in your ideas or paste reference content."
                className="w-full h-32 p-3 border border-gray-600 bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow resize-none text-base placeholder-gray-500 text-gray-200"
                maxLength={20000}
            />
        </div>

        {/* Options and Counter */}
        <div className="px-4 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="quickPace"
                    checked={isQuickPace}
                    onChange={(e) => setIsQuickPace(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-amber-600 focus:ring-amber-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="quickPace" className="text-sm font-medium text-gray-300">Quick pace</label>
                <InfoIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-sm text-gray-500 font-mono">
                {value.length} / 20000
            </div>
        </div>

        {/* Suggestions */}
        <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between gap-2">
           <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
             {currentSuggestions.map((suggestion, i) => (
                <button 
                    key={i} 
                    onClick={() => onChange(suggestion)}
                    className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                    {suggestion}
                </button>
            ))}
           </div>
            <button 
                onClick={() => setCurrentSuggestions(getRandomSuggestions())}
                className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white"
            >
                <RefreshIcon className="h-4 w-4" />
                Change
            </button>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-6 flex justify-center">
        <button 
            onClick={onGenerate}
            className="flex items-center bg-amber-500 text-black px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
            <GenerateIcon className="h-6 w-6 mr-3" />
            <span>ACTION!</span>
        </button>
      </div>
    </div>
  );
};
