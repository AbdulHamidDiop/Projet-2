import { Injectable } from '@angular/core';
import { Game } from '@common/game';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';
import { NamingConvention } from './headers';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    games: Game[] = [];
    private selectedGame: Game = {} as Game;

    constructor(public fetchService: FetchService) {
        this.getAllGames().then((games) => {
            this.games = games;
        });
    }

    getSelectedGame(): Game {
        return this.selectedGame;
    }

    selectGame(game: Game): void {
        this.selectedGame = game;
    }

    async getAllGames(): Promise<Game[]> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'game');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const games: Game[] = await response.json();
        return games;
    }

    async addGame(game: Game): Promise<void> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'game/importgame', {
            method: 'POST',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify(game),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        this.games = await this.getAllGames();
    }

    getGameByID(id: string): Game {
        const game = this.games.find((g) => g.id === id);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    }

    async toggleGameHidden(gameID: string): Promise<void> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'game/togglehidden', {
            method: 'PATCH',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
            body: JSON.stringify({ id: gameID }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteGameByID(id: string): Promise<boolean> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'game/delete/' + id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }

    async checkHiddenOrDeleted(game: Game): Promise<boolean> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'game/availability/' + game.id, {
            method: 'GET',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const availability: boolean = await response.json();
        return availability;
    }
}

export { Game };
