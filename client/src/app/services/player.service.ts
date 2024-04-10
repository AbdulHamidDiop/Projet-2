import { Injectable } from '@angular/core';
import { Player } from '@common/game';
const RED = 0xff0000; // Mettre dans un fichier

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
        let bestPlayer: Player = this.playersInGame[0];
        for (let i = 1; i < this.playersInGame.length; i++) {
            if (this.playersInGame[i].score > bestPlayer.score) {
                bestPlayer = this.playersInGame[i];
            }
        }
        return bestPlayer.score;
    }
}
