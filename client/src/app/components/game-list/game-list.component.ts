import { Component, OnInit } from '@angular/core';
import { Game, GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent implements OnInit {
    games: Game[];
    constructor(public gameService: GameService) {}

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
