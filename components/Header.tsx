
import React, { useState } from 'react';
import SettingsModal from './SettingsModal';
import { Prompts } from '../types';
import { CogIcon } from './icons/CogIcon';

interface HeaderProps {
    onRestart: () => void;
    prompts: Prompts;
    setPrompts: React.Dispatch<React.SetStateAction<Prompts>>;
}

const Header: React.FC<HeaderProps> = ({ onRestart, prompts, setPrompts }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                                🤖 AI Day Planner Pro
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onRestart}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Restart
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-label="Settings"
                            >
                                <CogIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                prompts={prompts}
                setPrompts={setPrompts}
            />
        </>
    );
};

export default Header;
