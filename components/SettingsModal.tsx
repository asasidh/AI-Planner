
import React, { useState, useEffect } from 'react';
import { Prompts } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompts: Prompts;
    setPrompts: React.Dispatch<React.SetStateAction<Prompts>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, prompts, setPrompts }) => {
    const [localPrompts, setLocalPrompts] = useState<Prompts>(prompts);

    useEffect(() => {
        setLocalPrompts(prompts);
    }, [prompts]);

    if (!isOpen) return null;

    const handleSave = () => {
        setPrompts(localPrompts);
        onClose();
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, key: keyof Prompts) => {
        setLocalPrompts(prev => ({...prev, [key]: e.target.value}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Agent Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analyzer Agent Prompt</label>
                        <textarea
                            value={localPrompts.analyzer}
                            onChange={(e) => handleInputChange(e, 'analyzer')}
                            rows={6}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep Research Agent Prompt</label>
                        <textarea
                            value={localPrompts.researcher}
                            onChange={(e) => handleInputChange(e, 'researcher')}
                            rows={10}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Card Generator Prompt</label>
                        <textarea
                            value={localPrompts.newCardGenerator}
                            onChange={(e) => handleInputChange(e, 'newCardGenerator')}
                            rows={6}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Agenda</label>
                        <textarea
                            value={localPrompts.referenceAgenda}
                            onChange={(e) => handleInputChange(e, 'referenceAgenda')}
                            rows={10}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 mr-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
