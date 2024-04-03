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
    color?: number; // La couleur d'affichage du texte. Dépends du statut de l'utilisateur ( fonctionnalité #17)
    chatEnabled?: boolean; // Active ou désactive le chat
    outOfRoom?: boolean; // Si l'utilisateur abandonne la partie
    leftGame?: boolean;
}

export const YELLOW = 0xffff00;
export const BLACK = 0x000000;
export const RED = 0xff0000;
export const GREEN = 0x0000ff;
