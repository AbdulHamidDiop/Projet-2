import { Injectable } from '@angular/core';
import { FetchService } from '@app/services/fetch.service';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';
import { GameSession } from '@common/game-session';
import { environment } from 'src/environments/environment';
import { NamingConvention } from './headers';

@Injectable({
    providedIn: 'root',
})
export class GameSessionService {
    constructor(public fetchService: FetchService) {}

    async getGameWithoutCorrectShown(pin: string): Promise<Game> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'gameSession/questionswithoutcorrect/' + pin);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const game: Game = await response.json();
        return game;
    }

    async checkAnswer(answer: string[], sessionPin: string, questionID: string): Promise<boolean> {
        try {
            const response = await this.fetchService.fetch(environment.serverUrl + 'gameSession/check', {
                method: 'POST',
                headers: {
                    [NamingConvention.CONTENT_TYPE]: 'application/json',
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
        const response = await this.fetchService.fetch(environment.serverUrl + 'gameSession/create/' + pin, {
            method: 'POST',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify(game),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async getAllSessions(): Promise<GameSession[]> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const sessions: GameSession[] = await response.json();
        return sessions;
    }

    async completeSession(pin: string, bestScore: number): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/completeSession', {
            method: 'PATCH',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify({ pin, bestScore }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteHistory(): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/deleteHistory', {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async addNbPlayers(nbPlayers: number, pin: string): Promise<void> {
        const response = await this.fetchService.fetch(API_URL + 'gameSession/addNbPlayers', {
            method: 'PATCH',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify({ nbPlayers, pin }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }
}
