export interface Choices {
    text: string;
    isCorrect: boolean;
}
enum Type {
    QCM = 'QCM',
    QRL = 'QRL',
}
export interface Question {
    type: Type;
    text: string;
    points: number;
    choices: Choices[];
}
export interface Game {
    id?: string;
    title: string;
    pin?: string;
    description?: string;
    duration?: number;
    lastModification?: Date;
    questions?: Question[];
    isHidden?: boolean;
    unavailable?: boolean;
}
