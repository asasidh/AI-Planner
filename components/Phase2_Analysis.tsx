import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface Phase2Props {
    questions: string[];
    onSubmit: (answers: string[]) => void;
}

const Phase2Analysis: React.FC<Phase2Props> = ({ questions, onSubmit }) => {
    const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isThinking, setIsThinking] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsThinking(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isListening && transcript) {
            setCurrentAnswer(transcript);
        }
    }, [transcript, isListening]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentQuestionIndex, submittedAnswers, isThinking]);

    const handleNextQuestion = () => {
        const newSubmittedAnswers = [...submittedAnswers, currentAnswer];
        if (currentQuestionIndex < questions.length - 1) {
            setSubmittedAnswers(newSubmittedAnswers);
            setCurrentAnswer('');
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            onSubmit(newSubmittedAnswers);
        }
    };
    
    const handleVoiceClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setCurrentAnswer('');
            startListening();
        }
    };

    if (isThinking) {
        return (
            <div className="bg-white dark:bg-gray-900/50 p-8 rounded-xl shadow-lg text-center animate-fade-in">
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Analyzer agent is reviewing your input...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900/50 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in flex flex-col max-h-[80vh]">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Clarification Needed</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The AI agent has a few questions to create the best plan.</p>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {submittedAnswers.map((answer, index) => (
                     <div key={index}>
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg rounded-bl-none">
                            <p className="text-indigo-800 dark:text-indigo-200">{questions[index]}</p>
                        </div>
                        <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-br-none ml-auto max-w-xl">
                            <p className="text-gray-800 dark:text-gray-200">{answer}</p>
                        </div>
                    </div>
                ))}
                {currentQuestionIndex < questions.length && (
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg rounded-bl-none">
                        <p className="text-indigo-800 dark:text-indigo-200">{questions[currentQuestionIndex]}</p>
                    </div>
                )}
                 <div ref={chatEndRef} />
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <div className="relative">
                    <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={3}
                        className="w-full p-3 pr-24 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleNextQuestion();
                            }
                        }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        {hasRecognitionSupport && (
                            <button
                                type="button"
                                onClick={handleVoiceClick}
                                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}
                            >
                                <MicrophoneIcon />
                            </button>
                        )}
                        <button onClick={handleNextQuestion} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 text-sm">
                            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Phase2Analysis;