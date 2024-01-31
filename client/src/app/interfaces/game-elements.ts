export interface Choices {
    text: string;
    isCorrect: boolean;
}
enum Type {
    QCM = 'QCM',
    QRL = 'QRL',
}
export interface Question {
    id: string;
    type: Type | string;
    lastModification: Date;
    text: string;
    points: number;
    choices?: Choices[] | null | undefined;
    answer?: string | null | undefined;
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
