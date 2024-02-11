import { Component } from '@angular/core';
import { Game, GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent {
    games: Game[];
    constructor(public gameService: GameService) {}

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    async ngOnInit() {
        this.games = await this.gameService.getAllGames();
        this.games = this.games.filter((game) => game.isHidden === false);
    }

    selectGame(game: Game): void {
        this.gameService.selectGame(game);
        this.checkAvailable(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    }

    async checkAvailable(game: Game): Promise<void> {
        if (await this.gameService.checkHiddenOrDeleted(game)) {
            game.unavailable = true;
            this.ngOnInit();
        }
    }
}
