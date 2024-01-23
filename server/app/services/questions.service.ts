import { Question } from '@common/game';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const QUESTIONS_PATH = "./assets/questions-database.json"

@Service()
export class QuestionsService {
    async getAllQuestions(): Promise<Question[]> {
        try {
            const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
            const questions: Question[] = JSON.parse(data);
            return questions;
        } catch (error) {
            throw error;
        }
    }

    async sortAllQuestions(): Promise<Question[]> {
        try {
            const questions: Question[] = await this.getAllQuestions();
            const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
            return sortedQuestions;
        } catch (error) {
            throw error;
        }
    }

    async deleteGameByID(id: String): Promise<Boolean>{
        try {
            const questions: Question[] = await this.getAllQuestions();
            const updatedQuestions: Question[] = questions.filter((question) => question.id !== id);
            await fs.writeFile(QUESTIONS_PATH, JSON.stringify(updatedQuestions, null, 2), 'utf8');
            return true;
        } catch (error) {
            throw error;
        }
    }
}
    