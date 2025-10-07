
import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { VideoResult } from './components/VideoResult';
import { generateVideo, generateAssistantResponse, generateStoryboard, generateImage } from './services/geminiService';
import { Footer } from './components/Footer';
import { CloseIcon, TrashIcon, CopyIcon, EmptyHistoryIcon, GlobeIcon, MootionLogo, AssistantIcon, GenerateIcon, InfoIcon } from './components/icons';
import { CategoryFilters } from './components/CategoryFilters';
import { InspirationGrid } from './components/InspirationGrid';
import { Sidebar } from './components/Sidebar';
import { GenerationControls } from './components/GenerationControls';
import { AssistantModal } from './components/AssistantModal';
import { PromptInput } from './components/PromptInput';
import { Editor, Scene } from './components/Editor';

// Re-defining LogoIcon here as Header.tsx is removed
export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1.5a.75.75 0 0 0-1.5 0V16.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4.5 6h1.5a.75.75 0 0 0 0-1.5H4.5ZM19.5 3a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0V4.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-1.5a.75.75 0 0 0 0 1.5H19.5a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H10.5a.75.75 0 0 0 0 1.5H18a.75.75 0 0 0 .75-.75V3Z" />
    <path d="m8.25 12.093 1.5 1.5a.75.75 0 0 0 1.06 0l2.25-2.25a.75.75 0 0 0-1.06-1.06l-1.72 1.72-1.72-1.72a.75.75 0 0 0-1.06 1.06l1.5 1.5Z" />
  </svg>
);


// --- TYPE DEFINITIONS ---
// Fix: Add AssistantMessage interface for AssistantModal.tsx
export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface HistoryItem {
  id:string;
  prompt: string;
  imageBase64?: string;
  videoUrl: string;
  timestamp: number;
  // Fix: Add aspectRatio and voice for Dashboard.tsx
  aspectRatio: string;
  voice: string;
}

// Fix: Add VOICES constant for Dashboard.tsx and other components
export const LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'fr-FR', name: 'Français' },
];

export const VOICES = [
    // English
    { id: 'en-deep-male', name: 'Deep Male', lang: 'en-US', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0259e8436001d67e584/audio.mp3' },
    { id: 'en-warm-female', name: 'Warm Female', lang: 'en-US', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0549e8436001d67e58a/audio.mp3' },
    { id: 'en-upbeat-male', name: 'Upbeat Male', lang: 'en-US', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0689e8436001d67e590/audio.mp3' },
    { id: 'en-calm-female', name: 'Calm Female', lang: 'en-US', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b07b9e8436001d67e596/audio.mp3' },
    // Spanish
    { id: 'es-standard-male', name: 'Estándar Masculino', lang: 'es-ES', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0a09e8436001d67e59c/audio.mp3' },
    { id: 'es-standard-female', name: 'Estándar Femenino', lang: 'es-ES', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0b29e8436001d67e5a2/audio.mp3' },
    // Portuguese
    { id: 'pt-standard-male', name: 'Padrão Masculino', lang: 'pt-BR', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0e19e8436001d67e5a8/audio.mp3' },
    { id: 'pt-standard-female', name: 'Padrão Feminino', lang: 'pt-BR', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b0f19e8436001d67e5ae/audio.mp3' },
    // French
    { id: 'fr-standard-male', name: 'Standard Masculin', lang: 'fr-FR', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b1079e8436001d67e5b4/audio.mp3' },
    { id: 'fr-standard-female', name: 'Standard Féminin', lang: 'fr-FR', previewUrl: 'https://storage.googleapis.com/bza-logic-stg-sps-assets/public/prompts/6696b1189e8436001d67e5ba/audio.mp3' },
];

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    currentUser: User | null;
    login: (username: string, pass: string) => Promise<void>;
    signup: (username: string, pass: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

// --- AUTH CONTEXT ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- AUTH PROVIDER ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('videoForgeCurrentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const getUsers = () => {
        try {
            const users = localStorage.getItem('videoForgeUsers');
            return users ? JSON.parse(users) : {};
        } catch (error) {
            return {};
        }
    };

    const login = async (username: string, pass: string): Promise<void> => {
        const users = getUsers();
        if (users[username] && users[username].password === pass) {
            const user = { id: users[username].id, username };
            setCurrentUser(user);
            localStorage.setItem('videoForgeCurrentUser', JSON.stringify(user));
        } else {
            throw new Error("Invalid username or password.");
        }
    };

    const signup = async (username: string, pass: string): Promise<void> => {
        const users = getUsers();
        if (users[username]) {
            throw new Error("Username already exists.");
        }
        const newUser = { id: crypto.randomUUID(), password: pass };
        users[username] = newUser;
        localStorage.setItem('videoForgeUsers', JSON.stringify(users));
        
        const user = { id: newUser.id, username };
        setCurrentUser(user);
        localStorage.setItem('videoForgeCurrentUser', JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('videoForgeCurrentUser');
    };
    
    const value = { currentUser, login, signup, logout, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// --- AUTH PAGE COMPONENT ---
const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isLoginView) {
                await login(username, password);
            } else {
                await signup(username, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D1B2A] text-gray-300 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-center items-center gap-3 mb-6">
                     <MootionLogo className="h-8 w-8 text-amber-500" />
                    <h1 className="text-3xl font-bold text-gray-100">AI Video Forge</h1>
                </div>
                <div className="bg-[#111827] border border-gray-700 rounded-xl p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-white">{isLoginView ? 'Director Login' : 'Join the Studio'}</h2>
                    {error && (
                        <p className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm mb-4 text-center">{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-amber-500 hover:text-amber-400 ml-2">
                            {isLoginView ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
             <footer className="w-full py-6 mt-8">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} AI Video Forge. Director's Desk Theme.</p>
                </div>
            </footer>
        </div>
    );
};

// --- HISTORY PANEL COMPONENT ---
interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onSelectHistory: (prompt: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onDeleteItem, onClearHistory, onSelectHistory }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300" aria-labelledby="slide-over-title" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-500 ease-in-out" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-screen max-w-md">
          <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
            <button type="button" className="rounded-full p-1 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white" onClick={onClose}>
              <span className="sr-only">Close panel</span>
              <CloseIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex h-full flex-col overflow-y-scroll bg-[#1A202C] border-l border-gray-700 py-6 shadow-xl text-gray-200">
            <div className="px-4 sm:px-6">
              <h2 id="slide-over-title" className="text-lg font-semibold leading-6 text-white">Production History</h2>
            </div>
            <div className="relative mt-6 flex-1 px-4 sm:px-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <EmptyHistoryIcon className="h-24 w-24 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400">No Productions Yet</h3>
                  <p>Your generated videos will appear here.</p>
                </div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {history.map((item) => (
                      <li key={item.id} className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 flex-shrink-0 bg-black rounded-md overflow-hidden border border-gray-600">
                             <video src={item.videoUrl} className="w-full h-full object-cover" poster={item.imageBase64}></video>
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm text-gray-300 line-clamp-3 break-words">{item.prompt}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                           <button onClick={() => { onSelectHistory(item.prompt); onClose(); }} className="flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300">
                             <CopyIcon className="h-3 w-3" />
                             Use Script
                           </button>
                           <button onClick={() => onDeleteItem(item.id)} className="flex items-center gap-1.5 text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800/70 text-red-300 rounded-md transition-colors">
                             <TrashIcon className="h-3 w-3" />
                             Delete
                           </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {history.length > 0 && (
                     <div className="mt-6 border-t border-gray-700 pt-6">
                        <button onClick={onClearHistory} className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-900/50 py-2 rounded-lg border border-red-500/50 transition-colors">
                           <TrashIcon className="h-4 w-4" />
                           Clear All History
                        </button>
                     </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiToolsSection: React.FC = () => (
    <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-4">Editing Suite</h2>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
            <div className="flex-shrink-0 w-60 h-36 bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden">
                <img src="https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600" className="w-full h-full object-cover" alt="AI Tool 1"/>
            </div>
             <div className="flex-shrink-0 w-60 h-36 bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden">
                <img src="https://images.pexels.com/photos/226589/pexels-photo-226589.jpeg?auto=compress&cs=tinysrgb&w=600" className="w-full h-full object-cover" alt="AI Tool 2"/>
            </div>
             <div className="flex-shrink-0 w-60 h-36 bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden">
                <img src="https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600" className="w-full h-full object-cover" alt="AI Tool 3"/>
            </div>
             <div className="flex-shrink-0 w-60 h-36 bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden">
                <img src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600" className="w-full h-full object-cover" alt="AI Tool 4"/>
            </div>
        </div>
    </div>
)


// --- MAIN APP COMPONENT ---
const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey] = useState<string>(process.env.API_KEY || '');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [language, setLanguage] = useState<string>('en-US');
  const [voice, setVoice] = useState<string>('en-upbeat-male');
  const { logout } = useAuth();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // New state for the storyboard workflow
  const [view, setView] = useState<'prompt' | 'editor' | 'result'>('prompt');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [title, setTitle] = useState<string>('');
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);

  const USER_UPLOADED_IMAGE_PROMPT_PLACEHOLDER = "User uploaded image. Regeneration will use the scene's script.";


  const getStorageKey = (key: string) => `videoForge_${key}_${currentUser?.id}`;

  useEffect(() => {
    if (!currentUser) return;
    try {
        const storedHistory = localStorage.getItem(getStorageKey('history'));
        if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (isAssistantOpen && assistantMessages.length === 0) {
        setAssistantMessages([
            {
                id: crypto.randomUUID(),
                role: 'model',
                text: "Hello! I'm your AI Scripting Assistant. How can I help you create a great video today? You can ask me to brainstorm ideas, write a script from scratch, or refine something you've already written."
            }
        ]);
    }
  }, [isAssistantOpen, assistantMessages.length]);

  const addToHistory = async (prompt: string, videoUrl: string) => {
    if (!currentUser) return;
    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt,
        videoUrl,
        timestamp: Date.now(),
        aspectRatio: aspectRatio,
        voice: voice,
    };
    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep history to 50 items
    setHistory(updatedHistory);
    localStorage.setItem(getStorageKey('history'), JSON.stringify(updatedHistory));
  };
  
  const handleDeleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(getStorageKey('history'), JSON.stringify(updatedHistory));
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(getStorageKey('history'));
    setIsHistoryPanelOpen(false);
  };

  const handleSelectHistory = (historyPrompt: string) => {
    setPrompt(historyPrompt);
  };

  const handleApplyScript = (script: string) => {
    setPrompt(script);
    setIsAssistantOpen(false);
  };
  
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    const firstVoiceForLang = VOICES.find(v => v.lang === langCode);
    if (firstVoiceForLang) {
        setVoice(firstVoiceForLang.id);
    }
  };
  
  const handleSendMessageToAssistant = async (message: string) => {
    if (!apiKey) {
        setError('API Key is not configured to use the assistant.');
        return;
    }
    const userMessage: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: message
    };
    const updatedMessages = [...assistantMessages, userMessage];
    setAssistantMessages(updatedMessages);
    setIsAssistantLoading(true);

    try {
        const responseText = await generateAssistantResponse(updatedMessages, apiKey);
        const modelMessage: AssistantMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText
        };
        setAssistantMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Assistant error:", error);
        const errorMessage: AssistantMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: `Sorry, I ran into an error: ${error instanceof Error ? error.message : 'Please try again.'}`
        };
        setAssistantMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsAssistantLoading(false);
    }
  };
  
  const handleGenerateStoryboard = useCallback(async () => {
    if (prompt.trim() === '') {
      setError('Please enter a script to generate a video.');
      return;
    }
    if (!apiKey) {
        setError('API Key is not configured. Please set the API_KEY environment variable.');
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        setLoadingMessage("Drafting your storyboard...");
        const storyboardData = await generateStoryboard(prompt, apiKey);
        setTitle(storyboardData.title);

        setLoadingMessage(`Generating ${storyboardData.scenes.length} scene visuals...`);
        const imagePromises = storyboardData.scenes.map(scene => generateImage(scene.imagePrompt, apiKey));
        const imagesBase64 = await Promise.all(imagePromises);

        const newScenes: Scene[] = storyboardData.scenes.map((scene, index) => ({
            id: crypto.randomUUID(),
            prompt: scene.prompt,
            imagePrompt: scene.imagePrompt,
            imageBase64: imagesBase64[index],
            description: '',
        }));
        
        setScenes(newScenes);
        setView('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey]);

  const handleGenerateVideoFromStoryboard = useCallback(async () => {
    if (scenes.length === 0) {
      setError('Cannot generate a video from an empty storyboard.');
      return;
    }
    if (!apiKey) {
        setError('API Key is not configured. Please set the API_KEY environment variable.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    
    // Combine scene prompts into one script for the video generation
    const combinedPrompt = scenes.map((scene, i) => `Scene ${i + 1}: ${scene.prompt}`).join('\n\n');
    // Use the first scene's image as the reference image
    const firstImageBase64 = scenes[0]?.imageBase64 || null;

    try {
        setLoadingMessage(`Initializing final video generation...`);
        const videoUrl = await generateVideo(combinedPrompt, setLoadingMessage, apiKey, aspectRatio, firstImageBase64);
        setGeneratedVideoUrl(videoUrl);
        await addToHistory(title || 'Untitled Storyboard', videoUrl);
        setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
      setView('editor'); // Go back to editor on failure
    } finally {
      setIsLoading(false);
    }
  }, [scenes, apiKey, history, currentUser, aspectRatio, voice, title]);

  const handleBackToPrompt = () => {
    setPrompt('');
    setGeneratedVideoUrl(null);
    setError(null);
    setScenes([]);
    setTitle('');
    setView('prompt');
  };

    const handleDeleteScene = (id: string) => {
        if (scenes.length <= 1) {
            setError("You cannot delete the last scene.");
            return;
        }
        setScenes(scenes.filter(s => s.id !== id));
    };

    const handleAddScene = async () => {
        if (isAddingScene) return;
        setIsAddingScene(true);
        setError(null);
        try {
            const imagePrompt = "A simple, neutral, professional background for a video scene.";
            const imageBase64 = await generateImage(imagePrompt, apiKey);
            const newScene: Scene = {
                id: crypto.randomUUID(),
                prompt: "A new scene. Describe what happens here.",
                imagePrompt: imagePrompt,
                imageBase64: imageBase64,
                description: '',
            };
            setScenes(prev => [...prev, newScene]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add new scene.');
        } finally {
            setIsAddingScene(false);
        }
    };

    const handleRegenerateSceneImage = async (id: string) => {
        const sceneToRegenerate = scenes.find(s => s.id === id);
        if (!sceneToRegenerate || regeneratingSceneId) return;
    
        setRegeneratingSceneId(id);
        setError(null);
        try {
            let promptForImageGen: string;
    
            // If the image was a user upload, its imagePrompt is a placeholder.
            // In this case, we MUST use the main scene script (`prompt`) for regeneration.
            if (sceneToRegenerate.imagePrompt === USER_UPLOADED_IMAGE_PROMPT_PLACEHOLDER) {
                promptForImageGen = sceneToRegenerate.prompt;
            } else {
                promptForImageGen = sceneToRegenerate.imagePrompt;
            }
    
            // Final check to ensure we don't use an empty or placeholder prompt.
            if (!promptForImageGen || promptForImageGen === USER_UPLOADED_IMAGE_PROMPT_PLACEHOLDER) {
                setError("Cannot regenerate image: the scene script is empty and there's no original image prompt.");
                setRegeneratingSceneId(null);
                return;
            }
    
            const newImageBase64 = await generateImage(promptForImageGen, apiKey);
    
            setScenes(prevScenes => prevScenes.map(s => s.id === id ? { 
                ...s, 
                imageBase64: newImageBase64,
                // After regenerating, update the imagePrompt to what was just used.
                // This ensures subsequent regenerations are consistent.
                imagePrompt: promptForImageGen
            } : s));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate image.');
        } finally {
            setRegeneratingSceneId(null);
        }
    };

    const handleReplaceSceneImage = (id: string, newImageBase64: string) => {
        setScenes(prevScenes => prevScenes.map(s => s.id === id ? { 
            ...s, 
            imageBase64: newImageBase64,
            imagePrompt: USER_UPLOADED_IMAGE_PROMPT_PLACEHOLDER
        } : s));
    };


  const renderForge = () => (
     <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="absolute top-6 right-6">
            <button className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                <GlobeIcon className="h-6 w-6 text-gray-400" />
            </button>
        </div>

        <div className="text-center my-12">
           <h1 className="text-5xl font-bold text-white tracking-tight">Faceless short videos</h1>
        </div>

        {error && (() => {
            const isQuotaError = error && (error.toLowerCase().includes('quota') || error.toLowerCase().includes('resource_exhausted'));
            return (
                <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative w-full mb-6" role="alert">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                            <InfoIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold">
                                {isQuotaError ? 'API Quota Exceeded' : 'Generation Failed'}
                            </p>
                            <p className="text-sm">{error}</p>
                            {isQuotaError && (
                                <p className="text-sm mt-2">
                                    You've reached the usage limit for the API. Please visit the{' '}
                                    <a href="https://aistudio.google.com/app/u/0/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-100">
                                        Google AI Studio Dashboard
                                    </a>
                                    {' '}to check your quota and usage details.
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setError(null)} className="absolute top-1 right-1 p-2 rounded-md hover:bg-red-900/50 transition-colors">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            );
        })()}
        
        <PromptInput value={prompt} onChange={setPrompt} onGenerate={handleGenerateStoryboard} />
        
        <div className="w-full max-w-3xl mx-auto -mt-2 flex justify-center">
             <button 
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-transparent border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 hover:text-white font-semibold rounded-full text-sm transition-colors"
            >
                <AssistantIcon className="h-5 w-5" />
                AI Script Assistant
            </button>
        </div>
        
        <GenerationControls
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          language={language}
          onLanguageChange={handleLanguageChange}
          voice={voice}
          onVoiceChange={setVoice}
        />
        <CategoryFilters />
        <InspirationGrid onSelectPrompt={setPrompt} />
        <AiToolsSection />

        <Footer />
     </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingScreen message={loadingMessage} />
        </div>
      );
    }

    switch (view) {
      case 'editor':
        return (
          <Editor
            title={title}
            onTitleChange={setTitle}
            scenes={scenes}
            onScenesChange={setScenes}
            onGenerateVideo={handleGenerateVideoFromStoryboard}
            onBack={handleBackToPrompt}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onRegenerateSceneImage={handleRegenerateSceneImage}
            onReplaceSceneImage={handleReplaceSceneImage}
            isAddingScene={isAddingScene}
            regeneratingSceneId={regeneratingSceneId}
            error={error}
            onClearError={() => setError(null)}
          />
        );
      case 'result':
        return (
          <div className="flex items-center justify-center h-full bg-[#0D1B2A]">
            <VideoResult
              videoUrl={generatedVideoUrl!}
              onNewGeneration={handleBackToPrompt}
              onShowHistory={() => setIsHistoryPanelOpen(true)}
            />
          </div>
        );
      case 'prompt':
      default:
        return <div className="relative z-10 h-full">{renderForge()}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0D1B2A]">
      <Sidebar 
          currentUser={currentUser}
          logout={logout}
          onToggleHistory={() => setIsHistoryPanelOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 noise-bg z-0"></div>
        {renderContent()}
      </main>
      <HistoryPanel isOpen={isHistoryPanelOpen} onClose={() => setIsHistoryPanelOpen(false)} history={history} onDeleteItem={handleDeleteItem} onClearHistory={handleClearHistory} onSelectHistory={handleSelectHistory} />
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        messages={assistantMessages}
        onSendMessage={handleSendMessageToAssistant}
        isLoading={isAssistantLoading}
        onApplyScript={handleApplyScript}
      />
    </div>
  )
};

// --- APP WRAPPER & EXPORT ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D1B2A] text-white">
        Initializing Director's Desk...
      </div>
    );
  }

  return currentUser ? <MainApp /> : <AuthPage />;
}

export default App;
