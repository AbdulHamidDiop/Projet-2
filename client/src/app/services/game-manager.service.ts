import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Feedback } from '@common/feedback';
import { Game, Question } from '@common/game';
import { FetchService } from './fetch.service';
import { GameSessionService } from './game-session.service';

@Injectable({
    providedIn: 'root', // SPRINT 2: might have to not be a singleton
})
export class GameManagerService {
    game: Game;
    gamePin: string;
    currentQuestionIndex: number = 0;
    endGame: boolean = false;

    constructor(
        private gameSessionService: GameSessionService,
        private fetchService: FetchService,
    ) {}

    async initialize(pin: string) {
        this.gamePin = pin;
        const game = await this.gameSessionService.getQuestionsWithoutCorrectShown(pin);
        if (game) {
            this.game = game;
        }
    }

    reset() {
        this.currentQuestionIndex = 0;
        this.endGame = false;
    }

    firstQuestion(): Question {
        if (this.game && this.game.questions[0]) {
            return this.game.questions[0];
        }
        return {} as Question;
    }

    goNextQuestion(): Question {
        if (this.game) {
            if (this.currentQuestionIndex + 1 === this.game.questions.length) {
                this.endGame = true;
                return this.game.questions[this.currentQuestionIndex];
            } else {
                return this.game.questions[++this.currentQuestionIndex];
            }
        }
        return {} as Question;
    }

    onLastQuestion(): boolean {
        if (this.game) {
            return this.currentQuestionIndex === this.game.questions.length - 1;
        }
        return false;
    }

    async isCorrectAnswer(answer: string[], questionID: string): Promise<boolean> {
        return await this.gameSessionService.checkAnswer(answer, this.gamePin, questionID);
    }

    async getFeedBack(questionId: string, answer: string[]): Promise<Feedback[]> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/feedback', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionPin: this.gamePin, questionID: questionId, submittedAnswers: answer }),
        });
        const feedback = await response.json();
        return feedback;
    }
}
