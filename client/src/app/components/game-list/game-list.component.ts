import { Component } from '@angular/core';
import { Game, GameService } from '../../services/game.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent {
    constructor(public gameService: GameService) {}

    selectGame(game: Game): void {
        this.gameService.selectGame(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    }

    check(game : Game): void{
        this.gameService.checkGame(game.id).subscribe(game => {
            if (game.isHidden || game === null) {
              this.getSelectedGame().unavailable = true;
            } 
          });
    }
}
