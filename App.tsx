import React, { useState, useCallback } from 'react';
import { AppPhase, ChallengeCardData, AgendaItem, InitialContext, FullContext, Prompts } from './types';
import { analyzeContext, deepResearch, generateNewCards } from './services/geminiService';
import { DEFAULT_PROMPTS } from './constants';
import Header from './components/Header';
import Phase1InfoGathering from './components/Phase1_InfoGathering';
import Phase2Analysis from './components/Phase2_Analysis';
import Phase3Research from './components/Phase3_Research';
import Phase4Refinement from './components/Phase4_Refinement';

const App: React.FC = () => {
    const [phase, setPhase] = useState<AppPhase>(AppPhase.INFO_GATHERING);
    const [initialContext, setInitialContext] = useState<InitialContext | null>(null);
    const [analysisQuestions, setAnalysisQuestions] = useState<string[]>([]);
    const [fullContext, setFullContext] = useState<FullContext | null>(null);
    const [agenda, setAgenda] = useState<AgendaItem[]>([]);
    const [challengeCards, setChallengeCards] = useState<ChallengeCardData[]>([]);
    const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPTS);
    const [error, setError] = useState<string | null>(null);

    const handleInfoSubmit = useCallback(async (context: InitialContext) => {
        setPhase(AppPhase.ANALYZING);
        setError(null);
        setInitialContext(context);
        try {
            const questions = await analyzeContext(context, prompts.analyzer);
            if (questions && questions.length > 0) {
                setAnalysisQuestions(questions);
            } else {
                const newFullContext = { ...context, followUpAnswers: [] };
                setFullContext(newFullContext);
                setPhase(AppPhase.RESEARCHING);
                await handleStartResearch(newFullContext);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to analyze the context. Please try again.');
            setPhase(AppPhase.INFO_GATHERING);
        }
    }, [prompts.analyzer]);

    const handleAnalysisSubmit = useCallback(async (answers: string[]) => {
        if (!initialContext) return;
        setPhase(AppPhase.RESEARCHING);
        setError(null);
        const newFullContext = { ...initialContext, followUpAnswers: answers };
        setFullContext(newFullContext);
        await handleStartResearch(newFullContext);
    }, [initialContext]);

    const handleStartResearch = useCallback(async (context: FullContext) => {
        try {
            const result = await deepResearch(context, prompts.researcher, prompts.referenceAgenda);
            setAgenda(result.agenda);
            setChallengeCards(result.challengeCards);
            setPhase(AppPhase.REFINING);
        } catch (e) {
            console.error(e);
            setError('Deep research failed. Please check your inputs and try again.');
            setPhase(AppPhase.INFO_GATHERING);
        }
    }, [prompts.researcher, prompts.referenceAgenda]);

    const handleGenerateNewCards = useCallback(async (topic: string) => {
        if (!fullContext) return [];
        try {
            const newCards = await generateNewCards(topic, fullContext, prompts.newCardGenerator);
            setChallengeCards(prev => [...prev, ...newCards]);
            return newCards;
        } catch (e) {
            console.error(e);
            setError('Failed to generate new challenge cards.');
            return [];
        }
    }, [fullContext, prompts.newCardGenerator]);
    
    const handleRestart = () => {
        setPhase(AppPhase.INFO_GATHERING);
        setInitialContext(null);
        setAnalysisQuestions([]);
        setFullContext(null);
        setAgenda([]);
        setChallengeCards([]);
        setError(null);
    };

    const renderPhase = () => {
        switch (phase) {
            case AppPhase.INFO_GATHERING:
                return <Phase1InfoGathering onSubmit={handleInfoSubmit} />;
            case AppPhase.ANALYZING:
                return <Phase2Analysis questions={analysisQuestions} onSubmit={handleAnalysisSubmit} />;
            case AppPhase.RESEARCHING:
                return <Phase3Research />;
            case AppPhase.REFINING:
                return <Phase4Refinement 
                    agenda={agenda} 
                    initialCards={challengeCards}
                    onGenerateNewCards={handleGenerateNewCards}
                    customerName={fullContext?.customerName || 'Valued Customer'}
                    />;
            default:
                return <Phase1InfoGathering onSubmit={handleInfoSubmit} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans">
            <Header onRestart={handleRestart} prompts={prompts} setPrompts={setPrompts} />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                <div className="max-w-4xl mx-auto">
                    {renderPhase()}
                </div>
            </main>
        </div>
    );
};

export default App;