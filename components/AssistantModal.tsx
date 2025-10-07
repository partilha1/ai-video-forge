
import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage } from '../App';
import { CloseIcon, SendIcon, AssistantIcon, CopyIcon } from './icons';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AssistantMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onApplyScript: (script: string) => void;
}

const ChatMessage: React.FC<{ message: AssistantMessage; onApplyScript: (script: string) => void }> = ({ message, onApplyScript }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isModel ? 'bg-gray-700/60 rounded-bl-none' : 'bg-indigo-600 rounded-br-none'}`}>
                 <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                 {isModel && !message.text.startsWith("Sorry, I ran into an error:") && (
                    <div className="mt-2 pt-2 border-t border-gray-600/50 flex justify-end">
                        <button 
                            onClick={() => onApplyScript(message.text)}
                            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-900/50 hover:bg-indigo-900/80 px-2 py-1 rounded-md transition-colors"
                        >
                            <CopyIcon className="h-3 w-3" />
                            Use this Script
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading, onApplyScript }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Focus input when modal opens
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300"
      aria-labelledby="assistant-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
                <AssistantIcon className="h-6 w-6 text-indigo-400" />
                <h2 id="assistant-modal-title" className="text-lg font-semibold text-white">
                    AI Scripting Assistant
                </h2>
            </div>
            <button
                type="button"
                className="rounded-full p-1 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={onClose}
            >
                <span className="sr-only">Close assistant</span>
                <CloseIcon className="h-6 w-6" aria-hidden="true" />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onApplyScript={onApplyScript} />
            ))}
             {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-700/60 rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800">
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Brainstorm your next video idea..."
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-sm text-gray-200 placeholder-gray-500"
                    rows={2}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="h-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
