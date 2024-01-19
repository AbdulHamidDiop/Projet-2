import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../interfaces/game-props';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    games: Game[];
    private selectedGame: BehaviorSubject<Game | null> = new BehaviorSubject<Game | null>(null);

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

    getSelectedGame(): BehaviorSubject<Game | null> {
        return this.selectedGame;
    }

    selectGame(game: Game): void {
        this.selectedGame.next(game);
    }
}
export { Game };
