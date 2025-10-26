
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

const researchMessages = [
    "Performing deep research on the customer's industry...",
    "Analyzing market trends and competitors...",
    "Cross-referencing areas of interest with latest AI advancements...",
    "Consulting reference agendas for optimal structure...",
    "Crafting impactful challenge cards...",
    "Gathering supporting sources and links...",
    "Finalizing the draft plan..."
];

const Phase3Research: React.FC = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % researchMessages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-xl shadow-lg text-center animate-fade-in flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-6">Deep Research in Progress</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
                This may take a moment. The AI agent is building a comprehensive plan for you.
            </p>
            <div className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium h-6">
                {researchMessages[currentMessageIndex]}
            </div>
        </div>
    );
};

export default Phase3Research;
