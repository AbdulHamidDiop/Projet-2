export interface QCMStats {
    questionId: string;
    choiceAmount: number;
    choiceIndex: number;
    correctIndex: number;
    selected: boolean;
}

export interface QRLStats {
    questionId: string;
    edited: boolean;
}
