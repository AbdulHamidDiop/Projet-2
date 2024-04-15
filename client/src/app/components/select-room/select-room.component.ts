import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';
import { MAX_PIN_CHARACTERS } from '@common/consts';

@Component({
    selector: 'app-select-room',
    templateUrl: './select-room.component.html',
    styleUrls: ['./select-room.component.scss'],
})
export class SelectRoomComponent implements AfterViewInit {
    @ViewChild('input') roomField!: ElementRef;

    constructor(private socket: SocketRoomService) {}
    async joinRoom(input: HTMLInputElement) {
        this.socket.joinRoom(input.value);
        this.socket.room = input.value;
        try {
            await this.socket.joinAllNamespaces(input.value);
        } catch (error) {
            return;
        }
    }

    restrictInput(event: Event) {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > MAX_PIN_CHARACTERS) {
            input.value = input.value.slice(0, MAX_PIN_CHARACTERS);
        }
    }

    ngAfterViewInit() {
        this.roomField.nativeElement.focus();
    }
}
