import { Component } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';

const MAX_CHARACTERS = 4;
@Component({
    selector: 'app-select-room',
    templateUrl: './select-room.component.html',
    styleUrls: ['./select-room.component.scss'],
})
export class SelectRoomComponent {
    constructor(private socket: SocketRoomService) {}
    joinRoom(input: HTMLInputElement) {
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > MAX_CHARACTERS) {
            input.value = input.value.slice(0, MAX_CHARACTERS);
        }
        this.socket.joinRoom(input.value);
        this.socket.room = input.value;
        this.socket.joinAllNamespaces(input.value);
    }
}
