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
        const roomId = input.value;
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > MAX_CHARACTERS) {
            input.value = input.value.slice(0, MAX_CHARACTERS);
        }
        this.socket.joinRoom(roomId);
        this.socket.room = roomId;
        this.socket.joinAllNamespaces(roomId).subscribe({
            next: () => console.log(`Successfully joined ${roomId} in all namespaces`),
            error: (error) => console.error(`Error joining ${roomId} in all namespaces`, error),
        });
    }
}
