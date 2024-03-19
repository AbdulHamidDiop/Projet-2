import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';
import { Events, Namespaces as nsp } from '@common/sockets';

const START_TIMER_DELAY = 500;

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent implements OnDestroy {
    fullView: boolean = true;
    roomIdEntryView: boolean = true;
    usernameEntryView: boolean = false;
    playerPanelView: boolean = false;
    player: Player = { name: '', isHost: false, id: '', score: 0, bonusCount: 0 };
    game: Game = {} as Game;
    players: Player[] = [];
    constructor(
        private gameService: GameService,
        private socket: SocketRoomService,
        readonly router: Router,
    ) {
        this.socket.leaveRoomSubscribe().subscribe(() => {
            this.fullView = false;
            this.roomIdEntryView = true;
            this.usernameEntryView = false;
            this.playerPanelView = false;
            this.fullView = true;
        });

        this.socket.roomJoinSubscribe().subscribe(() => {
            if (this.roomIdEntryView) {
                this.fullView = false;
                this.roomIdEntryView = false;
                this.usernameEntryView = true;
                this.playerPanelView = false;
                this.fullView = true;
            }
        });

        this.socket.getGameId().subscribe((id) => {
            this.game = this.gameService.getGameByID(id);
        });

        this.gameStartSubscribe();

        this.socket.getPlayers().subscribe((players) => {
            this.players = players;
        });

        this.socket.getProfile().subscribe((player) => {
            this.player = player;
            this.fullView = false;
            this.roomIdEntryView = false;
            this.usernameEntryView = false;
            this.playerPanelView = true;
            this.fullView = true;
        });

        this.socket.kickSubscribe().subscribe(() => {
            alert('Votre nom est banni.');
            /*            this.snackBar.open('Votre nom est banni', 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });*/
            this.router.navigate(['/waiting']);
        });

        this.socket.disconnectSubscribe().subscribe(() => {
            this.router.navigate(['/waiting']);
        });
    }

    ngOnDestroy() {
        this.socket.leaveRoom();
    }

    gameStartSubscribe() {
        this.socket.gameStartSubscribe().subscribe(() => {
            if (this.player.isHost) {
                setTimeout(() => {
                    this.socket.sendMessage(Events.START_TIMER, nsp.GAME);
                }, START_TIMER_DELAY);
                this.router.navigate(['/hostView/' + this.game.id]);
            } else {
                this.router.navigate(['/game/' + this.game.id]);
            }
        });
    }
}
