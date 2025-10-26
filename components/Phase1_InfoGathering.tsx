
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InitialContext } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface Phase1Props {
    onSubmit: (context: InitialContext) => void;
}

const formFields: { id: keyof InitialContext; label: string; placeholder: string, rows: number }[] = [
    { id: 'customerName', label: 'Customer Name', placeholder: 'e.g., Acme Corporation', rows: 1 },
    { id: 'executives', label: 'Executives Attending', placeholder: 'e.g., CEO, CTO, Head of Innovation', rows: 2 },
    { id: 'lineOfBusiness', label: 'Line of Business / Industry', placeholder: 'e.g., Retail, Manufacturing, Supply Chain Logistics', rows: 2 },
    { id: 'areasOfInterest', label: 'Key Areas of Interest for AI', placeholder: 'e.g., Customer service automation, predictive maintenance, demand forecasting', rows: 4 },
    { id: 'customerExpectations', label: 'Customer Expectations for the Day', placeholder: 'e.g., Identify 3 pilot projects, understand GenAI impact on their business', rows: 4 },
];

const Phase1InfoGathering: React.FC<Phase1Props> = ({ onSubmit }) => {
    const [context, setContext] = useState<InitialContext>({
        customerName: '',
        executives: '',
        lineOfBusiness: '',
        areasOfInterest: '',
        customerExpectations: '',
    });
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const [activeField, setActiveField] = useState<keyof InitialContext | null>(null);

    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (activeField && transcript) {
            setContext(prev => ({ ...prev, [activeField]: prev[activeField] + transcript }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript]);


    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContext(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(context);
    };
    
    const handleVoiceClick = useCallback((field: keyof InitialContext) => {
        if (isListening) {
            stopListening();
            setActiveField(null);
        } else {
            setActiveField(field);
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return (
        <div className="bg-white dark:bg-gray-900/50 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Plan Your AI Day</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Start by providing context. The more details, the better the plan.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                {formFields.map(({ id, label, placeholder, rows }) => (
                     <div key={id} className="relative">
                        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <textarea
                            id={id}
                            name={id}
                            value={context[id]}
                            onChange={handleChange}
                            placeholder={placeholder}
                            rows={rows}
                            required
                            ref={activeField === id ? activeTextareaRef : null}
                            className="w-full p-3 pr-12 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        />
                         {hasRecognitionSupport && (
                             <button
                                 type="button"
                                 onClick={() => handleVoiceClick(id)}
                                 className={`absolute right-2 top-9 p-2 rounded-full transition-colors ${
                                    isListening && activeField === id ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                                 }`}
                                 aria-label={`Record for ${label}`}
                            >
                                <MicrophoneIcon />
                            </button>
                         )}
                    </div>
                ))}
                <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
                    Analyze & Ask Questions
                </button>
            </form>
        </div>
    );
};

export default Phase1InfoGathering;
