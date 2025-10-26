import React, { useState } from 'react';
import { AgendaItem, ChallengeCardData } from '../types';
import { generatePdf } from '../utils/pdfGenerator';
import { generateMarkdown } from '../utils/markdownGenerator';
import { PdfIcon } from './icons/PdfIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    agenda: AgendaItem[];
    selectedCards: ChallengeCardData[];
    customerName: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, agenda, selectedCards, customerName }) => {
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    
    if (!isOpen) return null;

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            await generatePdf(agenda, selectedCards, customerName);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleDownloadMarkdown = () => {
        generateMarkdown(agenda, selectedCards, customerName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Plan Preview & Export</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto bg-gray-100 dark:bg-gray-900 flex-grow">
                   <div className="prose dark:prose-invert max-w-none">
                        <h1 className="text-center">AI Day Plan: {customerName}</h1>
                        <hr />
                        <h2>Agenda</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Topic</th>
                                    <th>Presenter</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agenda.map((item, index) => (
                                    <tr key={`agenda-prev-${index}`}>
                                        <td>{item.time}</td>
                                        <td>{item.topic}</td>
                                        <td>{item.presenter}</td>
                                        <td>{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <hr />
                        <h2>Workshop Challenge Cards</h2>
                        {selectedCards.map((card, index) => (
                            <div key={`card-prev-${index}`} className="p-4 border rounded-md mb-4 bg-white dark:bg-gray-800">
                                <h3>{card.title}</h3>
                                <p><strong>Relevance:</strong> {card.relevance}</p>
                                <p><strong>Potential Impact:</strong> {card.potentialImpact}</p>
                                <p><strong>Success Criteria:</strong> {card.successCriteria}</p>
                                <strong>AI Solution Opportunities:</strong>
                                <ul>{card.aiSolutionOpportunities.map(opp => <li key={opp}>{opp}</li>)}</ul>
                            </div>
                        ))}
                   </div>
                </div>

                <div className="flex justify-end p-4 border-t dark:border-gray-700 space-x-4">
                    <button onClick={handleDownloadMarkdown} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2">
                        Download Markdown
                    </button>
                    <button 
                        onClick={handleDownloadPdf} 
                        disabled={isDownloadingPdf}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2"
                    >
                       {isDownloadingPdf ? <LoadingSpinner /> : <PdfIcon />}
                       {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
