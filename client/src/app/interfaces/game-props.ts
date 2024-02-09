export interface Choices {
    text: string;
    isCorrect: boolean;
}
enum Type {
    QCM = Type.QCM,
    QRL = Type.QRL,
}
export interface Question {
    type: Type;
    text: string;
    points: number;
    choices: Choices[];
    nbChoices: number;
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
