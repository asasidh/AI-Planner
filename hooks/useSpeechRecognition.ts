import { useState, useEffect, useRef } from 'react';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These types are not included in default TypeScript DOM definitions.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


// Polyfill for browsers that might have it vendor-prefixed
// Fix: Renamed variable to avoid shadowing the 'SpeechRecognition' type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    // Fix: This now correctly refers to the 'SpeechRecognition' interface type.
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Fix: Use the renamed variable.
        if (!SpeechRecognitionAPI) {
            console.error("Speech Recognition is not supported by this browser.");
            return;
        }

        // Fix: Use the renamed variable.
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript + ' ');
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
             if (recognitionRef.current) { // only stop if it was intentionally stopped
               setIsListening(false);
             }
        };


        recognitionRef.current = recognition;
        
        return () => {
          recognition.stop();
        }

    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript(''); // Clear previous transcript
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        // Fix: Use the renamed variable.
        hasRecognitionSupport: !!SpeechRecognitionAPI
    };
};
