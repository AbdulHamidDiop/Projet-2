import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class GameService {
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

    async getGameByID(id: string): Promise<Game> {
        const games: Game[] = await this.getAllGames();
        const game = games.find((g) => g.id === id);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    }

    async toggleGameHidden(id: string): Promise<boolean> {
        const response = await fetch(API_URL + 'game/togglehidden' + id, {
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
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return true;
    }
}
