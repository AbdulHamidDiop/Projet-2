import { EventEmitter, Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Question } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    deleteRequest = new EventEmitter<Question>();
    questions: Question[] = [];
    currentQuestionIndex: number = 0;

    constructor() {
        this.getAllQuestions().then((questions: Question[]) => {
            this.questions = questions;
        });
    }
    get question(): Question {
        if (this.questions.length === 0) {
            return {} as Question;
        } else if (this.currentQuestionIndex + 1 === this.questions.length) {
            return this.questions[this.currentQuestionIndex];
        } else {
            return this.questions[this.currentQuestionIndex++];
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        const response = await fetch(API_URL + 'questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async addQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/add', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async editQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/edit', {
            method: 'PUT',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/delete/' + question.id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        this.deleteRequest.emit(question);
    }

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const response = await fetch(API_URL + 'questions/test');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async checkAnswer(answers: string[], question: Question): Promise<boolean> {
        try {
            const response = await fetch(API_URL + 'questions/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers, question }),
            });

            if (!response.ok) {
                throw new Error(`Erreur de communication avec le serveur. Statut : ${response.status}`);
            }
            const result = await response.json();
            if (result && result.isCorrect !== undefined) {
                return result.isCorrect;
            } else {
                throw new Error('Réponse du serveur malformée');
            }
        } catch (error) {
            // console.error('Erreur lors de la vérification de la réponse:', error);
            return false;
        }
    }
}
