import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game, GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { PlayerService } from './../../services/player.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent implements OnInit {
    games: Game[];
    constructor(
        public gameService: GameService,
        public router: Router,
        public socket: SocketRoomService,
        private PlayerService: PlayerService,
    ) {}

    async ngOnInit() {
        this.games = await this.gameService.getAllGames();
        this.games = this.games.filter((game) => game.isHidden === false);
    }

    async selectGame(game: Game): Promise<void> {
        this.gameService.selectGame(game);
        await this.checkAvailable(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    }

    async checkAvailable(game: Game): Promise<void> {
        if (!(await this.gameService.checkHiddenOrDeleted(game))) {
            game.unavailable = true;
        }
    }

    launchGame(game: Game) {
        this.PlayerService.player.isHost = true;
        this.PlayerService.player.name = 'Organisateur';
        this.socket.createRoom(game.id);
        this.router.navigate(['/waiting']);
    }
}
