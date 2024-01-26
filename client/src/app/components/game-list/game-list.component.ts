import { Component } from '@angular/core';
import { Game, GameService } from '../../services/game.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
})
export class GameListComponent {
    constructor(public gameService: GameService) {}

    selectGame(game: Game): void {
        this.gameService.selectGame(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    } 

    testGame(game : Game): void{
    }

    startGame(game : Game){

    }

}
