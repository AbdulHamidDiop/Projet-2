import { Type } from '@common/game';

export interface Choices {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id?: string;
    type: Type.QCM | Type.QRL;
    text: string;
    points: number;
    choices: Choices[];
    lastModification?: Date;
    answer: string;
}

export interface Game {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: Question[];
    visible: boolean;
}
