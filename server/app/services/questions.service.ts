import { Choice, Question } from '@common/game';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const QUESTIONS_PATH = './assets/questions-database.json';

@Service()
export class QuestionsService {
    async getAllQuestions(): Promise<Question[]> {
        const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
        const questions: Question[] = JSON.parse(data);
        return questions;
    }

    async sortAllQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
        return sortedQuestions;
    }

    async addQuestion(question: Question): Promise<void> {
        const questions: Question[] = await this.getAllQuestions();
        if (questions.find((q) => q.id === question.id)) {
            questions.splice(
                questions.findIndex((q) => q.id === question.id),
                1,
            );
        }
        questions.push(question);
        await fs.writeFile(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
    }

    async deleteQuestionByID(id: string): Promise<boolean> {
        const questions: Question[] = await this.getAllQuestions();
        const updatedQuestions: Question[] = questions.filter((question) => question.id !== id);
        await fs.writeFile(QUESTIONS_PATH, JSON.stringify(updatedQuestions, null, 2), 'utf8');
        return true;
    }

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
        const questions: Question[] = JSON.parse(data);
        const questionsWithoutCorrect : Question[] = [];
        for (let i = 0; i < questions.length; i++) {
            const currentQuestion: Question = questions[i];
            const choicesWithoutCorrect : Choice[] = [];
            for (let j = 0; j < currentQuestion.choices.length; j++) {
                const currentChoice: Choice = currentQuestion.choices[i];
                const { isCorrect, ...choiceWithoutCorrect }: Choice = currentChoice;
                choicesWithoutCorrect.push(choiceWithoutCorrect);
            }
            currentQuestion.choices = choicesWithoutCorrect;
            questionsWithoutCorrect.push(currentQuestion);
        }
        return questionsWithoutCorrect;
    }

    async sortQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const questions: Question[] = await this.getQuestionsWithoutCorrectShown();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
        return sortedQuestions;
    }

    async isCorrectAnswer(choice : Choice, question : Question): Promise<boolean> {
        const questions: Question[] = await this.getAllQuestions();
        const questionCheck : Question = questions.find((q) => q.id === question.id);
        for (let i = 0; i < questionCheck.choices.length; i++){
            if (questionCheck.choices[i] === choice) {
                return questionCheck.choices[i].isCorrect;
            }
        }
        return false;
    }
}
