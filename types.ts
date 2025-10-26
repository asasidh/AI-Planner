
export enum AppPhase {
    INFO_GATHERING,
    ANALYZING,
    RESEARCHING,
    REFINING,
}

export interface InitialContext {
    customerName: string;
    executives: string;
    lineOfBusiness: string;
    areasOfInterest: string;
    customerExpectations: string;
}

export interface FullContext extends InitialContext {
    followUpAnswers: string[];
}

export interface AgendaItem {
    time: string;
    topic: string;
    presenter: string;
    description: string;
}

export interface ChallengeCardData {
    id: string;
    title: string;
    relevance: string;
    potentialImpact: string;
    successCriteria: string;
    aiSolutionOpportunities: string[];
    supportingSources: { title: string; uri: string }[];
}

export interface Prompts {
    analyzer: string;
    researcher: string;
    newCardGenerator: string;
    referenceAgenda: string;
}
