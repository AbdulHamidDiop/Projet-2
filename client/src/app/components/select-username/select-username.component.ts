import { Component } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { ChatMessage, SystemMessages as sysmsg } from '@common/message';

@Component({
    selector: 'app-select-username',
    templateUrl: './select-username.component.html',
    styleUrls: ['./select-username.component.scss'],
})
export class SelectUsernameComponent {
    constructor(
        private socket: SocketRoomService,
        private playerService: PlayerService,
    ) {}

    sendUsername(input: HTMLInputElement) {
        const regex = /^[a-zA-Z]+$/;
        if (regex.test(input.value) && input.value.length > 1) {
            const username = input.value.toLowerCase();
            this.socket.sendPlayerName(username);
            this.playerService.player.name = username;

            const message: ChatMessage = {
                author: sysmsg.AUTHOR,
                message: username + ' ' + sysmsg.PLAYER_JOINED,
                timeStamp: new Date().toLocaleTimeString(),
            };

            this.socket.sendChatMessage(message);
        } else {
            alert("Le nom entré n'est pas valide");
        }
    }
}
