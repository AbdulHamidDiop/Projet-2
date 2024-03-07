import { Component } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-select-username',
    templateUrl: './select-username.component.html',
    styleUrls: ['./select-username.component.scss'],
})
export class SelectUsernameComponent {
    constructor(private socket: SocketRoomService) {}

    sendUsername(input: HTMLInputElement) {
        this.socket.sendPlayerName(input.value);
    }
}
