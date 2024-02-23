import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Game, Question } from '@common/game';
import { Feedback } from './../../../../common/feedback';
import { FetchService } from './fetch.service';
import { GameService } from './game.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root', // SPRINT 2: might have to not be a singleton
})
export class GameManagerService {
    game: Game;
    currentQuestionIndex: number = 0;
    endGame: boolean = false;

    constructor(
        private gameService: GameService,
        private fetchService: FetchService,
        private playerService: PlayerService,
    ) {}

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

    async getFeedBack(questionId: string, answer: string[]): Promise<Feedback[]> {
        const response = await this.fetchService.fetch(API_URL + 'game/feedback', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameID: this.game.id, questionID: questionId, submittedAnswers: answer }),
        });
        const feedback = await response.json();
        return feedback;
    }
}
