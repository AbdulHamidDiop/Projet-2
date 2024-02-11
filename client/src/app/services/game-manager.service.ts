import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Game, Question } from '@common/game';
import { GameService } from './game.service';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    game: Game;
    currentQuestionIndex: number = 0;
    endGame: boolean = false;

    constructor(private gameService: GameService) {}

    async initialize(gameID: string) {
        const game = await this.gameService.getQuestionsWithoutCorrectShown(gameID);
        if (game) {
            this.game = game;
        }
    }

    reset() {
        this.currentQuestionIndex = 0;
        this.endGame = false;
    }

    nextQuestion(): Question {
        if (this.game) {
            if (this.currentQuestionIndex + 1 === this.game.questions.length) {
                this.endGame = true;
                return this.game.questions[this.currentQuestionIndex];
            } else {
                return this.game.questions[this.currentQuestionIndex++];
            }
        }
        return {} as Question;
    }

    async isCorrectAnswer(answer: string[], questionID: string): Promise<boolean> {
        return await this.gameService.checkAnswer(answer, this.game.id, questionID);
    }

    async getFeedBack(questionID: string, answer: string[]): Promise<unknown[]> {
        const response = await fetch(API_URL + 'game/feedback', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameID: this.game.id, questionID, submittedAnswers: answer }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const feedback = await response.json();
        return feedback;
    }
}
