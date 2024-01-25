import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../interfaces/game-props';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    games: Game[];
    // Modification : Déclaration de selectedGame comme Game directement
    private selectedGame: Game = {} as Game;

    constructor() {
        this.games = [
            {
                title: 'dshjgfhjdfghjdbf',
            },
            {
                title: 'Kamelildort',
            },
        ];
    }

    // Modification : Modification du type de retour de getSelectedGame à Game
    getSelectedGame(): Game {
        return this.selectedGame;
    }

    selectGame(game: Game): void {
        this.selectedGame = game;
    }
}

export { Game };
