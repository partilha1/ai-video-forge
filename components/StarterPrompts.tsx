
import React from 'react';
import { SparklesIcon } from './icons';

interface StarterPromptsProps {
    onSelectPrompt: (prompt: string) => void;
}

const prompts = [
    "A majestic eagle soaring over a snow-capped mountain range, cinematic lighting.",
    "Time-lapse of a flower blooming, vibrant colors, macro shot.",
    "A futuristic cyberpunk city street with flying cars and neon signs, 4K.",
    "An animated, cute robot waving hello to the camera.",
];

export const StarterPrompts: React.FC<StarterPromptsProps> = ({ onSelectPrompt }) => {
    return (
        <div className="w-full max-w-3xl mt-8">
            <h3 className="text-lg font-semibold text-center text-gray-400 mb-4 flex items-center justify-center gap-2">
                <SparklesIcon className="h-5 w-5 text-yellow-400" />
                Not sure where to start? Try one of these:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectPrompt(prompt)}
                        className="text-left p-3 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:text-white"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};
