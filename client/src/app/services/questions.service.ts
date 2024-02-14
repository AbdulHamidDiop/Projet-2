/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter, Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Question } from '@common/game';
import { StatusCodes } from 'http-status-codes';
import { FetchService } from './fetch.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    deleteRequest = new EventEmitter<Question>();
    questions: Question[] = [];
    currentQuestionIndex: number = 0;

    constructor(private fetchService: FetchService) {
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
        const response = await this.fetchService.fetch(API_URL + 'questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async addQuestion(question: Question): Promise<boolean> {
        const response = await this.fetchService.fetch(API_URL + 'questions/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            if (response.status === StatusCodes.BAD_REQUEST) {
                window.alert("Votre question n'a pas été ajoutée à la banque de questions car elle existe déjà");
                return false;
            }
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }

    async editQuestion(question: Question): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'questions/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteQuestion(question: Question): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'questions/delete/' + question.id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        this.deleteRequest.emit(question);
    }

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const response = await this.fetchService.fetch(API_URL + 'questions/test');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async checkAnswer(answer: string[], id: string): Promise<boolean> {
        try {
            const response = await this.fetchService.fetch(API_URL + 'questions/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer, id }),
            });

            if (!response.ok) {
                throw new Error(`Erreur de communication avec le serveur. Statut : ${response.status}`);
            }
            const result = await response.json();

            if (result && result.isCorrect) {
                return result.isCorrect;
            } else {
                throw new Error('Réponse du serveur malformée');
            }
        } catch (error) {
            return false;
        }
    }
}
