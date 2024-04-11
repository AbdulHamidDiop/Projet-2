import { Player } from './game';

export interface QCMStats {
    questionId: string;
    choiceAmount: number;
    correctIndex: number;
    choiceIndex: number;
    selected: boolean;
    player?: Player; // Pour changer la couleur du joueur quand il envoie une réponse.
}

export interface BarChartChoiceStats {
    data: number[];
    label: string;
    backgroundColor: string;
}

export interface BarChartQuestionStats {
    questionID: string;
    data: BarChartChoiceStats[];
}

export interface QRLStats {
    questionId: string;
    edited: boolean;
}

export interface QRLAnswer {
    questionId: string;
    author: string;
    answer: string;
}

export interface QRLGrade {
    questionId: string;
    author: string;
    grade: number;
    multiplier: number;
}
