export interface Choice {
    text: string;
    isCorrect: boolean;
}

export enum Type {
    QCM = 'QCM',
    QRL = 'QRL',
}
export interface Question {
    id: string;
    type: Type;
    lastModification: Date;
    text: string;
    points: number;
    choices: Choice[];
}
export interface Game {
    id: string;
    title: string;
    pin?: string;
    description?: string;
    duration?: number;
    lastModification?: Date;
    questions: Question[];
    isHidden?: boolean;
    unavailable?: boolean;
}
