import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { START_GAME_DELAY } from '@common/consts';
import { Question } from '@common/game';
import { StatusCodes } from 'http-status-codes';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';
import { NamingConvention } from './headers';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    deleteRequest = new EventEmitter<Question>();
    questions: Question[] = [];
    currentQuestionIndex: number = 0;

    constructor(
        private fetchService: FetchService,
        private snackBar: MatSnackBar,
    ) {
        this.getAllQuestions().then((questions: Question[]) => {
            this.questions = questions;
        });
    }
    get question(): Question {
        if (!this.questions.length) {
            return {} as Question;
        } else if (this.currentQuestionIndex + 1 === this.questions.length) {
            return this.questions[this.currentQuestionIndex];
        } else {
            return this.questions[this.currentQuestionIndex++];
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions');
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
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions/add', {
            method: 'POST',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            if (response.status === StatusCodes.BAD_REQUEST) {
                this.snackBar.open("Votre question n'a pas été ajoutée à la banque de questions car elle existe déjà", 'Fermer', {
                    verticalPosition: 'top',
                    duration: START_GAME_DELAY,
                });
                return false;
            }
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }

    async editQuestion(question: Question): Promise<void> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions/edit', {
            method: 'PUT',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteQuestion(question: Question): Promise<void> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions/delete/' + question.id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        this.deleteRequest.emit(question);
    }

    async getQuestionsWithoutCorrectShown(): Promise<Question[]> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions/test');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async getRandomQuestions(): Promise<Question[]> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'questions/random');
        if (!response.ok) {
            return [];
        }
        const questions: Question[] = await response.json();
        return questions;
    }

    async checkAnswer(answer: string[], id: string): Promise<boolean> {
        try {
            const response = await this.fetchService.fetch(environment.serverUrl + 'questions/check', {
                method: 'POST',
                headers: {
                    [NamingConvention.CONTENT_TYPE]: 'application/json',
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
