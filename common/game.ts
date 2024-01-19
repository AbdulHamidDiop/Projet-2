export interface Choices {
  text: string;
  isCorrect: boolean;
}
export interface Question {
  type?: 'QCM' | 'QRL';
  text: string;
  points: number;
  choices: Choices[];
}
export interface Game {
  id: string;
  title: string;
  description: string;
  duration: number;
  lastModification: Date;
  isHidden: boolean;
  questions: Question[];
}