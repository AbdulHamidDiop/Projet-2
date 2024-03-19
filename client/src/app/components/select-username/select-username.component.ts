import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-select-username',
    templateUrl: './select-username.component.html',
    styleUrls: ['./select-username.component.scss'],
})
export class SelectUsernameComponent {
    constructor(
        private socket: SocketRoomService,
        private playerService: PlayerService,
        private snackBar: MatSnackBar,
    ) {}

    sendUsername(input: HTMLInputElement) {
        const regex = /^[a-zA-Z]+$/;
        if (regex.test(input.value) && input.value.length > 1) {
            const username = input.value.toLowerCase();
            this.socket.sendPlayerName(username);
            this.playerService.player.name = username;
            /* 
            Les joueurs ont déja un feedback quand un joueur rejoint la partie.

            const message: ChatMessage = {
                author: sysmsg.AUTHOR,
                message: username + ' ' + sysmsg.PLAYER_JOINED,
                timeStamp: new Date().toLocaleTimeString(),
            };

            this.socket.sendChatMessage(message);*/
        } else {
            this.snackBar.open('Le nom entré est invalide', 'fermer', {
                verticalPosition: 'top',
            });
        }
    }
}
