import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionService } from '@app/services/game-session.service';
import { Game, GameService } from '@app/services/game.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['game-list.component.scss'],
})
export class GameListComponent implements OnInit {
    games: Game[];

    // gameSession et gameService necessaire pour lancer une partie test et une vrai partie respectivement
    // playerService necessaire pour correctement commencer une partie en tant qu'organisateur
    // router necessaire pour naviguer a la salle d'attente une fois un jeu lancé
    // socket necessaire pour initialise la room à laquelle les joueurs peuvent s'unir
    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        public gameSessionService: GameSessionService,
        public router: Router,
        public socket: SocketRoomService,
        private playerService: PlayerService,
    ) {}

    async ngOnInit() {
        this.games = await this.gameService.getAllGames();
        this.games = this.games.filter((game) => !game.isHidden);
    }

    async selectGame(game: Game): Promise<void> {
        this.gameService.selectGame(game);
        await this.setGameAvailability(game);
    }

    getSelectedGame(): Game {
        return this.gameService.getSelectedGame();
    }

    async setGameAvailability(game: Game): Promise<void> {
        if (!(await this.gameService.checkHiddenOrDeleted(game))) {
            game.unavailable = true;
        }
    }

    async launchGame(game: Game) {
        this.selectGame(game).then(() => {
            if (game.unavailable) {
                return;
            } else {
                this.socket.leaveRoom();
                this.playerService.player.isHost = true;
                this.playerService.player.name = 'Organisateur';
                this.socket.createRoom(game);
                this.router.navigate(['/waiting']);
            }
        });
    }

    async launchTestGame(game: Game) {
        this.selectGame(game).then(async () => {
            if (game.unavailable) {
                return;
            } else {
                await this.gameSessionService.createSession(game.id, game);
            }
        });
    }
}
