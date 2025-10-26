
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface Phase2Props {
    questions: string[];
    onSubmit: (answers: string[]) => void;
}

const Phase2Analysis: React.FC<Phase2Props> = ({ questions, onSubmit }) => {
    const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isThinking, setIsThinking] = useState(true);

    useEffect(() => {
        // Simulating the agent "thinking" before presenting questions
        const timer = setTimeout(() => setIsThinking(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isListening && transcript) {
            handleAnswerChange(transcript);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentQuestionIndex, isThinking]);

    const handleAnswerChange = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = value;
        setAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            onSubmit(answers);
        }
    };
    
    const handleVoiceClick = () => {
        if (isListening) {
            stopListening();
        } else {
            handleAnswerChange(''); // Clear previous text before starting
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
                {questions.slice(0, currentQuestionIndex + 1).map((q, index) => (
                    <div key={index}>
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg rounded-bl-none">
                            <p className="text-indigo-800 dark:text-indigo-200">{q}</p>
                        </div>
                        {answers[index] && index <= currentQuestionIndex && (
                            <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-br-none ml-auto max-w-xl">
                                <p className="text-gray-800 dark:text-gray-200">{answers[index]}</p>
                            </div>
                        )}
                    </div>
                ))}
                 <div ref={chatEndRef} />
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <div className="relative">
                    <textarea
                        value={answers[currentQuestionIndex]}
                        onChange={(e) => handleAnswerChange(e.target.value)}
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
