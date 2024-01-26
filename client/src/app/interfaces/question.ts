export interface Question {
    type: string;
    text: string;
    points: number;
    choices: Choice[];
}

export interface Choice {
    text: string;
    isCorrect: boolean;
    index: string;
}
