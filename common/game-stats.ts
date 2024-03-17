export interface QCMStats {
    questionId: string;
    choiceAmount: number;
    choiceIndex: number;
    selected: boolean;
}

export interface BarChartChoiceStats {
    data: number[];
    label: string;
}

export interface BarChartQuestionStats {
    questionID: string;
    data: BarChartChoiceStats[];
}

export interface QRLStats {
    questionId: string;
    edited: boolean;
}
