import { Choices, Question } from '@common/game';
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
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(b.lastModification).getTime() - new Date(a.lastModification).getTime());
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
        let questionFound = false;
        const questions: Question[] = await this.getAllQuestions();
        const updatedQuestions: Question[] = questions.filter((question) => {
            if (question.id === id) {
                questionFound = true;
                return false;
            }
            return true;
        });
        if (questionFound) {
            await fs.writeFile(QUESTIONS_PATH, JSON.stringify(updatedQuestions, null, 2), 'utf8');
        }
        return questionFound;
    }

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
        const questions: Question[] = JSON.parse(data);
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

    // TODO: implement the case where the question is not in the bank but still in a game
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
