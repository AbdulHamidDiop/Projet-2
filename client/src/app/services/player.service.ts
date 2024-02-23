import { Injectable } from '@angular/core';
import { Choices, Player, Question } from '@common/game';
import { API_URL } from '@common/consts';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    async getAllPlayers(): Promise<Player[]> {
        const response = await fetch(API_URL + '/players');
        return await response.json();
    }

    async addPlayer(player: Player): Promise<void> {
        await fetch(API_URL + '/players/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(player),
        });
    }

    async getPlayerById(id: string): Promise<Player | undefined> {
        const response = await fetch(API_URL + '/players/' + id);
        if (response.ok) {
            return await response.json();
        }
        return undefined;
    }

    async updatePlayer(player: Player): Promise<void> {
        await fetch(API_URL + '/players/update/' + player.id, {
            method: 'PUT',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(player),
        });
    }

    async removePlayer(id: string): Promise<void> {
        await fetch(API_URL + '/players/' + id, {
            method: 'DELETE',
        });
    }

    async sendPlayerChoice(choice: Choices, question: Question): Promise<void> {
        const response = await fetch(API_URL + '/players/choice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                choice,
                question,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send player choice to the server');
        }
    }
}
