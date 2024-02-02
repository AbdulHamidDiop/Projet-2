// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';
// import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    games: Game[];
    // Modification : Déclaration de selectedGame comme Game directement
    private selectedGame: Game = {} as Game;

    constructor() {
        this.getAllGames().then((games: Game[]) => {
            this.games = games;
        });
    }

    // Modification : Modification du type de retour de getSelectedGame à Game
    getSelectedGame(): Game {
        return this.selectedGame;
    }

    selectGame(game: Game): void {
        this.selectedGame = game;
    }

    async checkGame(id: string | undefined): Promise<Game> {
        // return this.http.get<Game>(`/api/game/${id}`);
        const response = await fetch(API_URL + 'game/' + id);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const game: Game = await response.json();
        return game;
    }

    async getAllGames(): Promise<Game[]> {
        const response = await fetch(API_URL + 'game');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const games: Game[] = await response.json();
        return games;
    }

    async addGame(game: Game): Promise<void> {
        const response = await fetch(API_URL + 'game/importgame', {
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

    getGameQuestionsByID(id: string): Question[] {
        const game = this.games.find((g) => g.id === id);
        if (!game) {
            return [];
        } else {
            return game.questions;
        }
    }

    async getGameByID(id: string): Promise<Game> {
        const games: Game[] = await this.getAllGames();
        const game = games.find((g) => g.id === id);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    }

    async toggleGameHidden(id: string): Promise<boolean> {
        const response = await fetch(API_URL + 'game/togglehidden', {
            method: 'PATCH',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }

    async deleteGameByID(id: string): Promise<boolean> {
        const response = await fetch(API_URL + 'game/deletegame/' + id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }
}

export { Game };
