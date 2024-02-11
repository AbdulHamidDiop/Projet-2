import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { Game } from '@common/game';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['game-card.component.scss'],
})
export class GameCardComponent {
    @Input() game!: Game;
    @Output() deleteEvent = new EventEmitter<Game>();
    @Output() checkEvent = new EventEmitter<Game>();
    constructor(
        private router: Router,
        private gameService: GameService,
    ) {}
    onCheck(game: Game) {
        this.gameService.toggleGameHidden(String(game.id)).then(() => {
            this.checkEvent.emit(this.game);
        });
    }

    onExportButtonClick(game: Game) {
        const { isHidden, ...gameWithoutHidden }: Game = game;
        const jsonData = JSON.stringify(gameWithoutHidden);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    onDeleteButtonClick(game: Game) {
        this.gameService.deleteGameByID(String(game.id));
        this.deleteEvent.emit(this.game);
    }

    onModifyButtonClick(game: Game) {
        this.router.navigate([`/admin/createGame/${game.id}`]);
    }
}
