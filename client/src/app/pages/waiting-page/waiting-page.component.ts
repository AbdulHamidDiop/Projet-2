import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameSessionService } from '@app/services/game-session.service';
import { GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';
import { Events, Namespaces as nsp } from '@common/sockets';

const START_TIMER_DELAY = 500;
const START_GAME_DELAY = 5000;

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
    showCountDown: boolean = false;
    // eslint-disable-next-line max-params
    constructor(
        private gameService: GameService,
        private socket: SocketRoomService,
        readonly router: Router,
        private snackBar: MatSnackBar,
        private gameSessionService: GameSessionService,
    ) {
        this.socket.leaveRoomSubscribe().subscribe(() => {
            this.fullView = false;
            this.roomIdEntryView = true;
            this.usernameEntryView = false;
            this.playerPanelView = false;
            this.fullView = true;
        });

        this.socket.roomJoinSubscribe().subscribe((res) => {
            if (!res) {
                this.snackBar.open("Cette partie n'existe pas", 'Fermer', {
                    verticalPosition: 'top',
                    duration: 5000,
                });
                return;
            }
            if (this.roomIdEntryView) {
                this.fullView = false;
                this.roomIdEntryView = false;
                this.usernameEntryView = true;
                this.playerPanelView = false;
                this.fullView = true;
            }
        });

        this.socket.roomLockedSubscribe().subscribe(() => {
            this.snackBar.open('La partie est verrouillée', 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
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
            this.snackBar.open('Votre nom est banni', 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
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
            this.openCountDownModal();
            setTimeout(() => {
                if (this.player.isHost) {
                    setTimeout(() => {
                        this.socket.sendMessage(Events.START_TIMER, nsp.GAME);
                        this.socket.requestPlayers();
                    }, START_TIMER_DELAY);
                    this.router.navigate(['/hostView/' + this.game.id]);
                    this.gameSessionService.addNbPlayers(this.players.length);
                } else {
                    this.router.navigate(['/game/' + this.game.id]);
                }
            }, START_GAME_DELAY);
        });
    }

    openCountDownModal(): void {
        this.showCountDown = true;
    }

    onCountDownModalClosed(): void {
        this.showCountDown = false;
    }
}
