
import React, { useState, useEffect, useRef } from 'react';
import { 
    HomeIcon, ChevronRightIcon, DownloadIcon,
    TrashIcon, PlusIcon, RefreshIcon, UploadIcon,
    InfoIcon, CloseIcon
} from './icons';

export interface Scene {
  id: string;
  prompt: string;
  description: string;
  imagePrompt: string; // Keep for regeneration logic
  imageBase64: string;
}

interface EditorProps {
    title: string;
    onTitleChange: (title: string) => void;
    scenes: Scene[];
    onScenesChange: (scenes: Scene[]) => void;
    onGenerateVideo: () => void;
    onBack: () => void;
    onAddScene: () => void;
    onDeleteScene: (id: string) => void;
    onRegenerateSceneImage: (id: string) => void;
    onReplaceSceneImage: (id: string, imageBase64: string) => void;
    isAddingScene: boolean;
    regeneratingSceneId: string | null;
    error: string | null;
    onClearError: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
    title, onTitleChange, scenes, onScenesChange, onGenerateVideo, onBack,
    onAddScene, onDeleteScene, onRegenerateSceneImage, onReplaceSceneImage,
    isAddingScene, regeneratingSceneId, error, onClearError
}) => {
    const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        if (scenes.length > 0 && !selectedSceneId) {
            setSelectedSceneId(scenes[0].id);
        }
         if (scenes.length > 0 && selectedSceneId && !scenes.find(s => s.id === selectedSceneId)) {
            setSelectedSceneId(scenes[0].id);
        }
        if (scenes.length === 0) {
            setSelectedSceneId(null);
        }
    }, [scenes, selectedSceneId]);

    const handleSceneTextChange = (id: string, field: 'prompt' | 'description', value: string) => {
        const updatedScenes = scenes.map(scene => 
            scene.id === id ? { ...scene, [field]: value } : scene
        );
        onScenesChange(updatedScenes);
    };

    const handleReplaceClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = e.target;
        if (inputElement.files && inputElement.files[0] && selectedSceneId) {
            const file = inputElement.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    const base64String = (reader.result as string).split(',')[1];
                    onReplaceSceneImage(selectedSceneId, base64String);
                }
                // By this point, the async read is complete. It's safe to clear the input
                // so the user can select the same file again. This prevents a race condition.
                if (inputElement) {
                    inputElement.value = '';
                }
            };
            reader.onerror = () => {
                 console.error("Error reading file.");
                 if (inputElement) {
                    inputElement.value = '';
                }
            }
            reader.readAsDataURL(file);
        }
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
        if (dragItem.current !== null && dragOverItem.current !== dragItem.current) {
            const newScenes = [...scenes];
            const dragItemContent = newScenes[dragItem.current];
            newScenes.splice(dragItem.current, 1);
            newScenes.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = dragOverItem.current;
            onScenesChange(newScenes);
        }
    };
    
    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    const handleRegenerateSceneImage = () => {
        if (selectedSceneId) {
            onRegenerateSceneImage(selectedSceneId);
        }
    };


    const selectedScene = scenes.find(s => s.id === selectedSceneId);
    const selectedSceneIndex = selectedScene ? scenes.findIndex(s => s.id === selectedScene.id) + 1 : 0;
    const isQuotaError = error && (error.toLowerCase().includes('quota') || error.toLowerCase().includes('resource_exhausted'));


    return (
        <div className="bg-[#F3F4F6] text-gray-800 h-full flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-2 flex justify-between items-center flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-1">
                    <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-200 transition-colors" aria-label="Go Home">
                        <HomeIcon className="h-5 w-5 text-gray-600"/>
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <input 
                        value={title} 
                        onChange={(e) => onTitleChange(e.target.value)} 
                        className="font-semibold p-1 rounded-md bg-transparent focus:bg-gray-100 outline-none ring-1 ring-transparent focus:ring-indigo-500 transition"
                        aria-label="Video Title"
                        placeholder="Untitled Video"
                      />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                     <button 
                        onClick={onGenerateVideo} 
                        className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-px"
                    >
                        <span>Generate Video</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md relative flex-shrink-0" role="alert">
                        <div className="flex">
                            <div className="py-1"><InfoIcon className="h-6 w-6 text-red-500 mr-4" /></div>
                            <div>
                                <p className="font-bold">
                                    {isQuotaError ? 'API Quota Exceeded' : 'Generation Failed'}
                                </p>
                                <p className="text-sm">{error}</p>
                                {isQuotaError && (
                                     <p className="text-sm mt-1">
                                         Please visit the{' '}
                                         <a href="https://aistudio.google.com/app/u/0/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-900">
                                             Google AI Studio Dashboard
                                         </a>
                                         {' '}to check your quota.
                                     </p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClearError} className="absolute top-1.5 right-1.5 p-1 rounded-md hover:bg-red-200/50 transition-colors">
                            <CloseIcon className="h-5 w-5 text-red-600" />
                        </button>
                    </div>
                )}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Left Panel - Storyboard */}
                    <div className="w-2/5 flex flex-col gap-4">
                        <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {scenes.map((scene, index) => (
                                <div 
                                    key={scene.id} 
                                    onClick={() => setSelectedSceneId(scene.id)}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    draggable
                                    className={`p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 relative group ${selectedSceneId === scene.id ? 'border-2 border-indigo-500 bg-indigo-50 shadow-lg' : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800">Scene {index + 1}</h3>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative w-32 h-20 flex-shrink-0">
                                            <img src={`data:image/jpeg;base64,${scene.imageBase64}`} alt={`Visual for scene ${index + 1}`} className="w-full h-full object-cover rounded-md bg-gray-200" />
                                            {regeneratingSceneId === scene.id && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                                                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        <textarea 
                                            value={scene.prompt} 
                                            onChange={(e) => handleSceneTextChange(scene.id, 'prompt', e.target.value)} 
                                            className="w-full h-20 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            aria-label={`Script for Scene ${index + 1}`}
                                            placeholder="Describe what happens in this scene..."
                                        />
                                    </div>
                                     <textarea 
                                        value={scene.description} 
                                        onChange={(e) => handleSceneTextChange(scene.id, 'description', e.target.value)} 
                                        className="w-full mt-2 h-16 bg-gray-50 border border-gray-200 rounded-md p-2 text-xs resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        aria-label={`Description for Scene ${index + 1}`}
                                        placeholder="Notes (e.g., camera angle, character emotion)..."
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                                        disabled={scenes.length <= 1}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-100/80 disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
                                        aria-label="Delete scene"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={onAddScene}
                            disabled={isAddingScene}
                            className="w-full flex-shrink-0 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:cursor-wait disabled:bg-gray-200"
                        >
                            {isAddingScene ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                                    <span>Adding Scene...</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Add Scene</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Preview & Edit */}
                    <div className="w-3/5 bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                        {selectedScene ? (
                            <div className="w-full h-full flex flex-col items-center">
                                <h3 className="font-bold mb-4 text-gray-800">Scene {selectedSceneIndex} Editor</h3>
                                <div className="relative w-full max-w-[280px] aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden mb-6 shadow-md group">
                                    <img src={`data:image/jpeg;base64,${selectedScene.imageBase64}`} alt={`Preview for scene ${selectedSceneIndex}`} className="w-full h-full object-cover" />
                                    <a 
                                        href={`data:image/jpeg;base64,${selectedScene.imageBase64}`}
                                        download={`scene_${selectedSceneIndex}_image.jpg`}
                                        className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-600 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"
                                        aria-label="Download image"
                                    >
                                        <DownloadIcon className="h-5 w-5"/>
                                    </a>
                                    {regeneratingSceneId === selectedScene.id && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                            <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="w-full max-w-sm text-sm border-t border-gray-200 pt-6 space-y-3">
                                    <button 
                                        onClick={handleRegenerateSceneImage}
                                        disabled={!selectedSceneId || !!regeneratingSceneId}
                                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-wait"
                                    >
                                        <RefreshIcon className={`h-4 w-4 ${regeneratingSceneId === selectedSceneId ? 'animate-spin' : ''}`} />
                                        {regeneratingSceneId === selectedSceneId ? 'Regenerating...' : 'Regenerate Image'}
                                    </button>
                                    <button 
                                        onClick={handleReplaceClick}
                                        disabled={!selectedSceneId}
                                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                                    >
                                        <UploadIcon className="h-4 w-4" />
                                        Replace Image
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <PlusIcon className="h-12 w-12 mx-auto text-gray-300 mb-2"/>
                                <h3 className="font-semibold text-lg text-gray-600">Storyboard is Empty</h3>
                                <p>Click 'Add Scene' to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
