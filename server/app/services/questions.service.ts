import { NUMBER_RANDOM_QUESTIONS } from '@common/consts';
import { Question, Type } from '@common/game';
import { DB_COLLECTION_QUESTIONS } from '@common/utils/env';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class QuestionsService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Question> {
        return this.databaseService.database.collection(DB_COLLECTION_QUESTIONS);
    }

    async getAllQuestions(): Promise<Question[]> {
        const questions = await this.collection.find({}).toArray();
        return questions;
    }

    async sortAllQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
        return sortedQuestions;
    }

    async addQuestion(question: Question): Promise<boolean> {
        const questions: Question[] = await this.getAllQuestions();
        if (questions.find((q) => q.id === question.id)) {
            await this.collection.findOneAndDelete({ id: question.id });
        }
        if (questions.find((q) => q.text === question.text)) {
            return false;
        }
        await this.collection.insertOne(question);
        return true;
    }

    async deleteQuestionByID(id: string): Promise<boolean> {
        let questionFound = false;
        const questions: Question[] = await this.getAllQuestions();
        questions.filter((question) => {
            if (question.id === id) {
                questionFound = true;
                return false;
            }
            return true;
        });
        if (questionFound) {
            await this.collection.findOneAndDelete({ id });
        }
        return questionFound;
    }

    async getRandomQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const qcmQuestions = questions.filter((question) => question.type === Type.QCM);
        if (qcmQuestions.length < NUMBER_RANDOM_QUESTIONS) {
            throw new Error('Not enough QCM questions');
        }
        return this.selectRandomQuestions(qcmQuestions);
    }

    private shuffleQuestions(questions: Question[]): Question[] {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
    }

    private selectRandomQuestions(questions: Question[]): Question[] {
        questions = this.shuffleQuestions(questions);
        return questions.slice(0, NUMBER_RANDOM_QUESTIONS);
    }
}
