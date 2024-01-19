export interface Question {
    id: number;
    text: string;
    options: string[];
    correctOption: number;
}
  
export interface GameProps {
    description: string;
    timeLimitInSeconds: number;
    questions: Question[];
}