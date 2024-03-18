import { Component, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';
import { GAME_STARTED_MESSAGE, ROOM_LOCKED_MESSAGE, ROOM_UNLOCKED_MESSAGE } from '@common/message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-player-and-admin-panel',
    templateUrl: './player-and-admin-panel.component.html',
    styleUrls: ['./player-and-admin-panel.component.scss'],
})
export class PlayerAndAdminPanelComponent implements OnDestroy {
    @Input() player: Player = {} as Player;
    @Input() game: Game = {} as Game;
    @Input() players: Player[] = [];
    room: string;
    private roomLocked: boolean = false;
    private globalChatSubscription: Subscription;

    constructor(
        private socket: SocketRoomService,
        private snackBar: MatSnackBar,
    ) {
        this.globalChatSubscription = this.socket.getChatMessages().subscribe((message) => {
            if (message.author === 'room') {
                this.room = message.message;
            }
        });
    }

    lock() {
        if (!this.roomLocked) {
            this.socket.lockRoom();
            ROOM_LOCKED_MESSAGE.timeStamp = new Date().toLocaleTimeString();
            this.socket.sendChatMessage(ROOM_LOCKED_MESSAGE);
            this.roomLocked = true;
        }
    }

    unlock() {
        if (this.roomLocked) {
            this.socket.unlockRoom();
            ROOM_UNLOCKED_MESSAGE.timeStamp = new Date().toLocaleTimeString();
            this.socket.sendChatMessage(ROOM_UNLOCKED_MESSAGE);
            this.roomLocked = false;
        }
    }

    startGame() {
        if (this.players.length > 0) {
            this.socket.startGame();
            GAME_STARTED_MESSAGE.timeStamp = new Date().toLocaleTimeString();
            this.socket.sendChatMessage(GAME_STARTED_MESSAGE);
        } else {
            this.snackBar.open("Aucun joueur n'est présent dans la salle, le jeu ne peut pas commencer", 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
        }
    }

    kickPlayer(playerName: string) {
        this.socket.kickPlayer(playerName);
    }

    leaveRoom() {
        this.socket.leaveRoom();
    }

    ngOnDestroy() {
        this.globalChatSubscription.unsubscribe();
    }
}
