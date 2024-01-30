import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
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
        private http: HttpClient,
        private router: Router,
    ) {}
    onCheck(game: Game) {
        this.http.patch('http://localhost:3000/api/game/toggleHidden', { id: game.id }).subscribe((response: unknown) => {});
        this.checkEvent.emit(this.game);
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
        this.http.delete(`http://localhost:3000/api/game/deletegame/${game.id}`).subscribe((response: unknown) => {});
        this.deleteEvent.emit(this.game);
    }

    onModifyButtonClick(game: Game) {
        this.router.navigate([`/admin/createGame/${game.id}`]);
    }
}
