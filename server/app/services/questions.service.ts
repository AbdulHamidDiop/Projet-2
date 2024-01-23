import { Question } from '@common/game';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const QUESTIONS_PATH = "./assets/questions-database.json"

@Service()
export class QuestionsService {
    async getAllQuestions(): Promise<Question[]> {
        try {
            const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
            const games: Question[] = JSON.parse(data);
            return games;
        } catch (error) {
            throw error;
        }
    }
}
    