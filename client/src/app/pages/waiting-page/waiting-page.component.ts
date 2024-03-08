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
        this.socket.roomLockedSubscribe().subscribe(() => {
            alert("La salle d'attente est verrouillée.");
        });

        this.socket.unlockSubscribe().subscribe(() => {
            alert("La salle d'attente est déverouillée, le jeu ne peut pas commencer tant que la salle n'est pas verrouillée.");
        });

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
            this.router.navigate(['/waiting']);
        });

        this.socket.disconnectSubscribe().subscribe(() => {
            this.router.navigate(['/waiting']);
        });
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.socket.leaveRoom();
    }

    gameStartSubscribe() {
        this.socket.gameStartSubscribe().subscribe(() => {
            alert('Le jeu commence maintenant.');
            if (this.player.isHost) {
                this.router.navigate(['/game/' + this.game.id + '/results']);
            } else {
                this.router.navigate(['/game/' + this.game.id]);
            }
        });
    }
}
