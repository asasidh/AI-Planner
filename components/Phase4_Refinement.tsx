import React, { useState, useMemo } from 'react';
import { AgendaItem, ChallengeCardData } from '../types';
import ChallengeCard from './ChallengeCard';
import PreviewModal from './PreviewModal';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface Phase4Props {
    agenda: AgendaItem[];
    initialCards: ChallengeCardData[];
    onGenerateNewCards: (topic: string) => Promise<ChallengeCardData[]>;
    customerName: string;
}

const Phase4Refinement: React.FC<Phase4Props> = ({ agenda, initialCards, onGenerateNewCards, customerName }) => {
    const [cards, setCards] = useState<ChallengeCardData[]>(initialCards);
    const [votes, setVotes] = useState<{ [key: string]: boolean }>({});
    const [newTopic, setNewTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleVote = (cardId: string, vote: boolean) => {
        setVotes(prev => ({ ...prev, [cardId]: vote }));
    };

    const handleNewTopicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopic.trim()) return;
        setIsGenerating(true);
        const newCards = await onGenerateNewCards(newTopic);
        setCards(prev => [...prev, ...newCards]);
        setNewTopic('');
        setIsGenerating(false);
    };

    const selectedCards = useMemo(() => cards.filter(card => votes[card.id]), [cards, votes]);
    const unvotedCards = useMemo(() => cards.filter(card => votes[card.id] === undefined), [cards, votes]);

    return (
        <>
            <div className="space-y-12 animate-fade-in">
                {/* Agenda Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-4">Proposed Agenda</h2>
                    <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-lg p-6">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {agenda.map((item, index) => (
                                <li key={index} className="py-4">
                                    <div className="flex space-x-4">
                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 w-28">{item.time}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{item.topic}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Presenter: {item.presenter}</p>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300">{item.description}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Challenge Cards Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-4">Challenge Cards for Workshop</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Review and select the most relevant challenges for the hands-on session.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <ChallengeCard key={card.id} card={card} onVote={handleVote} vote={votes[card.id]} />
                        ))}
                    </div>
                </div>

                {/* New Topic Section */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">Add More Challenges</h3>
                    <form onSubmit={handleNewTopicSubmit} className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-lg flex items-center gap-4">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Enter a new topic or area..."
                            className="flex-grow p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" disabled={isGenerating} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
                            {isGenerating ? <LoadingSpinner /> : 'Generate 3 Cards'}
                        </button>
                    </form>
                </div>

                {/* Finalization Section */}
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-lg mt-12 sticky bottom-4 z-10 border dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">{selectedCards.length} of {cards.length} cards selected</h3>
                            {unvotedCards.length > 0 && <p className="text-sm text-yellow-600 dark:text-yellow-400">{unvotedCards.length} cards pending review.</p>}
                        </div>
                        <button 
                            onClick={() => setIsPreviewOpen(true)}
                            disabled={selectedCards.length === 0}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                        >
                           Preview & Export
                        </button>
                    </div>
                </div>
            </div>
            <PreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                agenda={agenda}
                selectedCards={selectedCards}
                customerName={customerName}
            />
        </>
    );
};

export default Phase4Refinement;