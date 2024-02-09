import { Component } from '@angular/core';
import { Game, GameService } from '../../services/game.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent {
    constructor(public gameService: GameService) {}
    games: Game[];

    async ngOnInit() {
        this.games = await this.gameService.getAllGames();
        this.games = this.games.filter((game) => game.isHidden === false);
    }

    selectGame(game: Game): void {
        this.gameService.selectGame(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    }
}
