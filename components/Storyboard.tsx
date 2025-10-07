
import React, { useRef, useState, DragEvent, UIEvent, useEffect } from 'react';
import { UploadIcon, TrashIcon, PlusIcon } from './icons';

export interface Scene {
  id: string;
  prompt: string;
  imageFile: File | null;
}

interface StoryboardProps {
  scenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
}

const KEYWORDS = [
  'cinematic', 'slow-motion', 'dramatic lighting', '4K', '8K', 'HD', 'time-lapse', 
  'macro shot', 'breathtaking landscapes', 'fast-paced edits', 'serene', 
  'tranquil', 'dynamic', 'close-up', 'wide shot', 'panning shot', 'dolly zoom', 
  'vibrant colors', 'neon lights', 'futuristic', 'cyberpunk', 'animated', 'realistic',
  'photorealistic', 'product showcase', 'explainer video', 'travel vlog', 'guided meditation'
];

const highlightRegex = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'gi');

const HighlightedPrompt: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return <>&nbsp;</>;
  const parts = text.split(highlightRegex);
  return (
    <>
      {parts.map((part, i) =>
        highlightRegex.test(part) ? (
          <span key={i} className="bg-indigo-900/50 rounded-[3px] py-0.5 px-1 font-medium text-indigo-300">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

interface SceneCardProps {
    scene: Scene;
    sceneNumber: number;
    onUpdate: (updatedPrompt: Partial<Scene>) => void;
    onRemove: () => void;
    isOnlyScene: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, sceneNumber, onUpdate, onRemove, isOnlyScene }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (scene.imageFile) {
            objectUrl = URL.createObjectURL(scene.imageFile);
            setImageUrl(objectUrl);
        } else {
            setImageUrl(null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [scene.imageFile]);

    const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        if (highlightRef.current) {
            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onUpdate({ imageFile: event.target.files[0] });
        }
    };
    
    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate({ imageFile: null });
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageClick = () => fileInputRef.current?.click();
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpdate({ imageFile: e.dataTransfer.files[0] });
        }
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 relative">
            <div className="absolute -top-2 -left-2 bg-indigo-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold border-4 border-gray-800">{sceneNumber}</div>
            
            <div className="flex flex-col md:flex-row gap-4 pt-2">
                <div 
                  className={`relative flex-shrink-0 w-full md:w-48 h-32 md:h-auto rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}
                  onClick={handleImageClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                      <button onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-600/70 hover:bg-red-500 text-white rounded-full p-1 text-xs">X</button>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 p-2">
                      <UploadIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Upload Image</p>
                      <p className="text-xs">(Optional)</p>
                    </div>
                  )}
                </div>

                <div className="relative w-full flex-1" style={{ minHeight: '128px' }}>
                    <div
                      ref={highlightRef}
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full bg-gray-900 border border-transparent rounded-lg p-3 text-gray-200 pointer-events-none whitespace-pre-wrap break-words overflow-y-auto font-mono text-sm"
                    >
                      <HighlightedPrompt text={scene.prompt} />
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={scene.prompt}
                      onChange={(e) => onUpdate({ prompt: e.target.value })}
                      onScroll={handleScroll}
                      placeholder={`e.g., A cinematic shot of a futuristic city...`}
                      className="absolute inset-0 w-full h-full bg-transparent border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-transparent caret-white placeholder-gray-500 font-mono text-sm"
                      spellCheck="false"
                    />
                </div>
            </div>
             {!isOnlyScene && (
                <button
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 bg-red-800/80 hover:bg-red-700/80 text-red-200 rounded-full p-1.5 transition-colors backdrop-blur-sm"
                    aria-label="Remove scene"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export const Storyboard: React.FC<StoryboardProps> = ({ scenes, onScenesChange }) => {

    const handleUpdateScene = (id: string, updatedProps: Partial<Scene>) => {
        onScenesChange(scenes.map(s => s.id === id ? { ...s, ...updatedProps } : s));
    };

    const handleAddScene = () => {
        const newScene: Scene = { id: crypto.randomUUID(), prompt: '', imageFile: null };
        onScenesChange([...scenes, newScene]);
    };

    const handleRemoveScene = (id: string) => {
        if (scenes.length > 1) {
            onScenesChange(scenes.filter(s => s.id !== id));
        }
    };
    
    return (
        <div className="w-full flex flex-col gap-4">
            {scenes.map((scene, index) => (
                <SceneCard
                    key={scene.id}
                    scene={scene}
                    sceneNumber={index + 1}
                    onUpdate={(updated) => handleUpdateScene(scene.id, updated)}
                    onRemove={() => handleRemoveScene(scene.id)}
                    isOnlyScene={scenes.length === 1}
                />
            ))}
            <button 
                onClick={handleAddScene}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
            >
                <PlusIcon className="h-5 w-5" />
                Add Scene
            </button>
        </div>
    );
};
