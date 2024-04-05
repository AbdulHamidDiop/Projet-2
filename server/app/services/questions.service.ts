/* eslint-disable no-restricted-imports */
import { Choices, Question } from '@common/game';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DB_COLLECTION_QUESTIONS } from 'utils/env';
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

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const questionsWithoutCorrect: Question[] = [];

        for (const currentQuestion of questions) {
            const choicesWithoutCorrect: Choices[] = [];
            for (const currentChoice of currentQuestion.choices) {
                const choiceWithoutCorrect: Choices = { ...currentChoice };
                delete choiceWithoutCorrect.isCorrect;
                choicesWithoutCorrect.push(choiceWithoutCorrect);
            }
            currentQuestion.choices = choicesWithoutCorrect;
            questionsWithoutCorrect.push(currentQuestion);
        }
        return questionsWithoutCorrect;
    }

    async isCorrectAnswer(answer: string[], id: string): Promise<boolean> {
        const questions: Question[] = await this.getAllQuestions();
        const question: Question | undefined = questions.find((q) => q.id === id);
        if (question?.choices) {
            const correctChoices = question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
            if (answer.length !== correctChoices.length || !answer.every((answr) => correctChoices.includes(answr))) {
                return false;
            }
            return true;
        }
        return true;
    }
}
