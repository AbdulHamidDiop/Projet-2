import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameSessionService } from '@app/services/game-session.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Game, Player } from '@common/game';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';

const START_TIMER_DELAY = 500;
const START_GAME_DELAY = 5000;

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent implements OnDestroy, OnInit {
    fullView: boolean = true;
    roomIdEntryView: boolean = true;
    usernameEntryView: boolean = false;
    playerPanelView: boolean = false;
    player: Player = { name: '', isHost: false, id: '', score: 0, bonusCount: 0 };
    game: Game = {} as Game;
    players: Player[] = [];
    showCountDown: boolean = false;

    playerLeftSubscription: Subscription;
    leaveRoomSubscription: Subscription;
    roomJoinSubscription: Subscription;
    roomLockedSubscription: Subscription;
    gamePinSubscription: Subscription;
    gameStartSubscription: Subscription;
    playersSubscription: Subscription;
    profileSubscription: Subscription;
    kickSubscription: Subscription;
    disconnectSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private gameSessionService: GameSessionService,
        private timeService: TimeService,
        private playerService: PlayerService,
        private socket: SocketRoomService,
        readonly router: Router,
        private snackBar: MatSnackBar,
    ) {
        this.setSockets();
    }

    gameStartSubscribe() {
        this.gameStartSubscription = this.socket.gameStartSubscribe().subscribe(() => {
            this.openCountDownModal();
            setTimeout(() => {
                if (this.player.isHost) {
                    setTimeout(() => {
                        this.socket.sendMessage(Events.START_TIMER, nsp.GAME);
                        this.socket.requestPlayers();
                    }, START_TIMER_DELAY);
                    this.router.navigate(['/hostView/' + this.game.id]);
                } else {
                    this.router.navigate(['/game/' + this.game.id]);
                }
            }, START_GAME_DELAY);
        });

        this.socket.randomGameStartSubscribe().subscribe(() => {
            this.router.navigate(['/game/' + this.game.id]);

            this.openCountDownModal();
            setTimeout(() => {
                setTimeout(() => {
                    this.socket.sendMessage(Events.START_TIMER, nsp.GAME);
                    this.socket.requestPlayers();
                }, START_TIMER_DELAY);
                this.router.navigate(['/game/' + this.game.id]);
            }, START_GAME_DELAY);
        });
    }
    ngOnInit(): void {
        window.addEventListener('popstate', this.onLocationChange);
        window.addEventListener('hashchange', this.onLocationChange);
    }

    ngOnDestroy() {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);

        this.leaveRoomSubscription.unsubscribe();
        this.roomJoinSubscription.unsubscribe();
        this.roomLockedSubscription.unsubscribe();
        this.gamePinSubscription.unsubscribe();
        this.gameStartSubscription.unsubscribe();
        this.playersSubscription.unsubscribe();
        this.profileSubscription.unsubscribe();
        this.kickSubscription.unsubscribe();
        this.disconnectSubscription.unsubscribe();
        this.playerLeftSubscription.unsubscribe();
    }

    setInitailView(): void {
        this.fullView = false;
        this.roomIdEntryView = true;
        this.usernameEntryView = false;
        this.playerPanelView = false;
        this.fullView = true;
    }

    onLocationChange = () => {
        this.socket.endGame();
    };

    openCountDownModal(): void {
        this.showCountDown = true;
    }

    onCountDownModalClosed(): void {
        this.showCountDown = false;
    }

    private setSockets(): void {
        this.leaveRoomSubscription = this.socket.leaveRoomSubscribe().subscribe(() => {
            this.fullView = false;
            this.roomIdEntryView = true;
            this.usernameEntryView = false;
            this.playerPanelView = false;
            this.fullView = true;
        });

        this.roomJoinSubscription = this.socket.roomJoinSubscribe().subscribe((res) => {
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

        this.roomLockedSubscription = this.socket.roomLockedSubscribe().subscribe(() => {
            this.snackBar.open('La partie est verrouillée', 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
        });

        this.socket.getChatMessages().subscribe(async (message) => {
            if (message.author === 'room') {
                this.socket.room = message.message;
                this.gameSessionService.getGameWithoutCorrectShown(this.socket.room).then((game: Game) => {
                    this.game = game;
                });
            }
        });

        this.gameStartSubscribe();

        this.gamePinSubscription = this.socket.getGamePin().subscribe((pin) => {
            this.gameSessionService.getGameWithoutCorrectShown(pin).then((game) => {
                this.game = game;
            });
        });

        this.playersSubscription = this.socket.getPlayers().subscribe((players) => {
            this.players = players;
            this.playerService.setGamePlayers(players);
        });

        this.profileSubscription = this.socket.getProfile().subscribe((player) => {
            this.player = player;
            this.fullView = false;
            this.roomIdEntryView = false;
            this.usernameEntryView = false;
            this.playerPanelView = true;
            this.fullView = true;
        });

        this.kickSubscription = this.socket.kickSubscribe().subscribe(() => {
            this.socket.endGame('Vous avez été expulsé de la partie');
        });

        this.disconnectSubscription = this.socket.disconnectSubscribe().subscribe(() => {
            this.router.navigate(['/waiting']);
        });

        this.playerLeftSubscription = this.socket.listenForMessages(nsp.GAME, Events.PLAYER_LEFT).subscribe((data: unknown) => {
            const username = (data as { user: string }).user;
            this.players = this.players.filter((p) => p.name !== username);
        });

        this.timeService.init(); // instanciating the service now to set up subscriptions early
    }
}
