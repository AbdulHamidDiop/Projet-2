import { Injectable } from '@angular/core';
import { FetchService } from '@app/services/fetch.service';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';
import { GameSession } from '@common/game-session';

@Injectable({
    providedIn: 'root',
})
export class GameSessionService {
    constructor(public fetchService: FetchService) {}

    async getQuestionsWithoutCorrectShown(pin: string): Promise<Game> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/questionswithoutcorrect/' + pin);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const game: Game = await response.json();
        return game;
    }

    async checkAnswer(answer: string[], sessionPin: string, questionID: string): Promise<boolean> {
        try {
            const response = await this.fetchService.fetch(API_URL + 'gameSession/check', {
                method: 'POST',
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer, sessionPin, questionID }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const result = await response.json();
            return result.isCorrect;
        } catch (error) {
            return false;
        }
    }

    async createSession(pin: string, game: Game): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/create/' + pin, {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(game),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async getAllSessions() : Promise<GameSession[]> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const sessions: GameSession[] = await response.json();
        return sessions;
    }

    async completeSession(pin: string) : Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/completeSession', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pin: pin }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }
}
