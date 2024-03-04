/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent {
    fullview: boolean = false;
    counter: number = 0;
    locked: boolean = false;
    name: string = 'admin';
    player: Player;
    game: Game;
    players: Player[] = [
        {
            id: '0',
            name: 'false User',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
        {
            id: '1',
            name: 'user',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
        {
            id: '2',
            name: 'admin',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
    ];
    constructor(
        private gameService: GameService,
        private socket: SocketRoomService,
        readonly router: Router,
    ) {
        const dicetoss = Math.random() * 3;
        if (dicetoss < 1) {
            this.name = 'user';
        } else if (dicetoss < 2) {
            this.name = 'user2';
        } else {
            this.name = 'user3';
        }

        this.socket.createRoomSubscribe().subscribe((room) => {
            alert('Room ' + room + ' was created');
        });

        this.socket.roomLockedSubscribe().subscribe(() => {
            alert('Room is locked');
        });
        this.socket.roomJoinSubscribe().subscribe(() => {
            this.fullview = true;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.socket.sendPlayerName(this.name);

            this.socket.getGameId().subscribe((id) => {
                this.game = this.gameService.getGameByID(id);
            });

            this.socket.getProfile().subscribe((player) => {
                this.player = player;
            });

            this.socket.getPlayers().subscribe((players) => {
                this.counter++;
                this.players = players;
            });

            this.socket.lockSubscribe().subscribe((response) => {
                if (response) {
                    this.locked = true;
                    alert('Room is locked');
                }
            });

            this.socket.unlockSubscribe().subscribe((response) => {
                if (response) {
                    this.locked = false;
                    alert('Room is unlocked');
                }
            });

            this.socket.gameStartSubscribe().subscribe(() => {
                alert('Le jeu commence maintenant.');
                if (this.name !== 'admin') {
                    setTimeout(() => {
                        this.router.navigate(['/game/462778813468']);
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    }, 1500);
                }
            });

            this.socket.kickSubscribe().subscribe((response) => {
                if (response === this.name) {
                    alert('Vous avez été exclu');
                    setTimeout(() => {
                        this.router.navigate(['/']);
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    }, 2500);
                }
            });

            this.socket.disconnectSubscribe().subscribe(() => {
                setTimeout(() => {
                    this.router.navigate(['/']);
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                }, 1000);
            });
        });
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.socket.leaveRoom();
    }

    joinRoom(input: HTMLInputElement) {
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > 4) {
            input.value = input.value.slice(0, 4);
        }
        this.socket.joinRoom(input.value);
    }

    lock() {
        this.socket.lockRoom();
    }

    unlock() {
        this.socket.unlockRoom();
    }

    startGame() {
        if (this.players.length > 1) {
            this.socket.startGame();
        } else {
            alert("Aucun joueur n'est présent dans le lobby, la partie ne peut pas commencer.");
        }
    }

    kickPlayer(player: string) {
        this.socket.kickPlayer(this.name, player);
    }
}
