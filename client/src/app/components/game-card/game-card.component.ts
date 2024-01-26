import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Game } from '@common/game';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['game-card.component.scss'],
})
export class GameCardComponent {
    @Input() game!: Game;
    constructor(private http: HttpClient) {}
    onCheck(game: Game) {
        this.http.patch('http://localhost:3000/api/admin/toggleHidden', { id: game.id }).subscribe((response: unknown) => {});
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
        this.http.delete(`http://localhost:3000/api/admin/deletegame/${game.id}`).subscribe((response: unknown) => {
            window.location.reload();
        });
    }

    onModifyButtonClick() {
        // link to create new game but with arguments
    }
}
