export interface Choices {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    type: 'QCM' | 'QRL';
    text: string;
    points: number;
    choices?: Choices[] | null | undefined;
    answer?: string | null | undefined;
}

export interface Game {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: Question[];
}
