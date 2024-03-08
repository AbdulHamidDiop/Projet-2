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
        const regex = /^[a-zA-Z]+$/;
        if (regex.test(input.value) && input.value.length > 1) {
            const username = input.value.toLowerCase();
            this.socket.sendPlayerName(username);
        } else {
            alert("Le nom entré n'est pas valide");
        }
    }
}
