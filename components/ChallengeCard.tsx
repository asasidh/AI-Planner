
import React from 'react';
import { ChallengeCardData } from '../types';

interface ChallengeCardProps {
    card: ChallengeCardData;
    onVote: (cardId: string, vote: boolean) => void;
    vote?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ card, onVote, vote }) => {
    const cardStateClasses = vote === true ? 'border-green-500' : vote === false ? 'border-red-500 opacity-60' : 'border-gray-200 dark:border-gray-700';

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 transition-all duration-300 flex flex-col ${cardStateClasses}`}>
            <div className="p-5 flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                <div className="mt-4 space-y-3 text-sm">
                    <p><strong className="text-gray-600 dark:text-gray-300">Relevance:</strong> {card.relevance}</p>
                    <p><strong className="text-gray-600 dark:text-gray-300">Potential Impact:</strong> {card.potentialImpact}</p>
                    <p><strong className="text-gray-600 dark:text-gray-300">Success Criteria:</strong> {card.successCriteria}</p>
                    <div>
                        <strong className="text-gray-600 dark:text-gray-300">AI Opportunities:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {card.aiSolutionOpportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                        </ul>
                    </div>
                     {card.supportingSources.length > 0 && (
                        <div>
                            <strong className="text-gray-600 dark:text-gray-300">Sources:</strong>
                            <div className="mt-1 space-x-2">
                                {card.supportingSources.map((source, i) => (
                                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                        [{i + 1}] {new URL(source.uri).hostname}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end space-x-2 rounded-b-md">
                <button
                    onClick={() => onVote(card.id, false)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${vote === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-200'}`}
                >
                    No
                </button>
                <button
                    onClick={() => onVote(card.id, true)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${vote === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-200'}`}
                >
                    Yes
                </button>
            </div>
        </div>
    );
};

export default ChallengeCard;
