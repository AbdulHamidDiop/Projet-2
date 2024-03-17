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
    async joinRoom(input: HTMLInputElement) {
        this.socket.joinRoom(input.value);
        this.socket.room = input.value;
        try {
            await this.socket.joinAllNamespaces(input.value);
            // Proceed to the next step after successful connection and room joining
        } catch (error) {
            console.error('Failed to join room in all namespaces', error);
            // Handle error (e.g., show error message to the user)
        }
    }

    restrictInput(event: any) {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > 4) {
          input.value = input.value.slice(0, MAX_CHARACTERS);
        }
      }
}
