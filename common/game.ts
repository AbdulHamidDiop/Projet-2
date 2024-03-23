export interface Choices {
    text: string;
    isCorrect: boolean;
    index: number;
}

export enum Type {
    QCM = 'QCM',
    QRL = 'QRL',
}
export interface Question {
    id: string;
    type: Type;
    lastModification: Date | null;
    text: string;
    points: number;
    choices: Choices[];
    answer: string;
}
export interface Game {
    id: string;
    title: string;
    pin?: string;
    description?: string;
    duration?: number;
    lastModification?: Date | null;
    questions: Question[];
    isHidden?: boolean;
    unavailable?: boolean;
}

export interface Player {
    name: string;
    isHost: boolean;
    id: string;
    score: number;
    bonusCount: number;
    leftGame?: boolean;
}
