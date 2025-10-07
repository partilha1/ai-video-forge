

import React, { useState, useEffect } from 'react';
import { VOICES, LANGUAGES } from '../App';
import { AspectRatioIcon, VoiceIcon, LanguageIcon, SpeakerWaveIcon } from './icons';

interface GenerationControlsProps {
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  language: string;
  onLanguageChange: (langCode: string) => void;
  voice: string;
  onVoiceChange: (voiceId: string) => void;
}

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4'];

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  aspectRatio,
  onAspectRatioChange,
  language,
  onLanguageChange,
  voice,
  onVoiceChange,
}) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effect to clean up the audio object
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        // Remove event listeners to prevent memory leaks
        audio.onended = null;
        audio.onerror = null;
      }
    };
  }, [audio]);

  // Stop playback when the voice selection changes
  useEffect(() => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [voice, language]);

  const handlePreview = () => {
    if (isPlaying && audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const selectedVoice = VOICES.find(v => v.id === voice);
    if (selectedVoice?.previewUrl) {
      // If there's an existing audio object, pause it before creating a new one
      if(audio) audio.pause();

      const newAudio = new Audio(selectedVoice.previewUrl);
      setAudio(newAudio);
      setIsPlaying(true);
      
      newAudio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });

      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => {
          console.error("Error playing audio preview.");
          setIsPlaying(false);
      };
    }
  };

  const availableVoices = VOICES.filter(v => v.lang === language);

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 bg-[#1A202C] border border-gray-700 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* Aspect Ratio Selector */}
      <div className="w-full lg:w-auto">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
          <AspectRatioIcon className="h-5 w-5 text-amber-400" />
          Aspect Ratio
        </label>
        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-md">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              onClick={() => onAspectRatioChange(ratio)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors w-full ${
                aspectRatio === ratio
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
      
      {/* Language Selector */}
      <div className="w-full lg:w-auto">
        <label htmlFor="lang-select" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <LanguageIcon className="h-5 w-5 text-amber-400" />
            Language
        </label>
        <select
            id="lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
        >
            {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
        </select>
      </div>

      {/* Voice Selector */}
      <div className="w-full lg:w-auto">
        <label htmlFor="voice-select" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
          <VoiceIcon className="h-5 w-5 text-amber-400" />
          Narration Voice
        </label>
        <div className="flex items-center gap-2">
            <select
                id="voice-select"
                value={voice}
                onChange={(e) => onVoiceChange(e.target.value)}
                className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            >
                {availableVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                    {v.name}
                    </option>
                ))}
            </select>
            <button 
                onClick={handlePreview}
                className={`p-2 rounded-md transition-colors flex-shrink-0 ${isPlaying ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                aria-label={isPlaying ? "Stop preview" : "Preview voice"}
            >
                <SpeakerWaveIcon className="h-5 w-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};
