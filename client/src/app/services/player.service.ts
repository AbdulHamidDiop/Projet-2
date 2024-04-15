import { Injectable } from '@angular/core';
import { Player, RED } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player = {
        name: '',
        isHost: false,
        id: '',
        score: 0,
        bonusCount: 0,
        color: RED,
        chatEnabled: true,
        leftGame: false,
    };

    playersInGame: Player[] = [];
    activePlayers(): Player[] {
        return this.playersInGame.filter((player) => !player.leftGame);
    }
    nActivePlayers(): number {
        return this.activePlayers().length;
    }

    addGamePlayers(player: Player): void {
        const index = this.playersInGame.findIndex((pl) => pl.name === player.name);
        if (index >= 0) {
            this.playersInGame[index] = player;
        } else {
            this.playersInGame.push(player);
        }
    }

    resetGamePlayers(): void {
        this.playersInGame = [];
    }

    findBestScore(): number {
        let bestPlayer: Player = this.player;
        for (const player of this.playersInGame) {
            if (player.score > bestPlayer.score) {
                bestPlayer = player;
            }
        }
        return bestPlayer.score;
    }

    setGamePlayers(players: Player[]): void {
        // adds only the players that are not already in the list
        players.forEach((player) => {
            const index = this.playersInGame.findIndex((pl) => pl.name === player.name);
            if (index < 0) {
                this.playersInGame.push(player);
            }
        });
    }
}
