import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full py-6 mt-8 border-t border-gray-800/50">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} AI Video Forge. Director's Desk Theme.</p>
            </div>
        </footer>
    );
};