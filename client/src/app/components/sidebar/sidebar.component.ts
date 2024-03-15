import { Component, Input } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { ChatMessage, MAX_MESSAGE_LENGTH } from '@common/message';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    @Input() player: Player = {} as Player;
    currentMessage: ChatMessage = { message: '' } as ChatMessage;
    private messageHistory: ChatMessage[] = [];

    constructor(private socketsService: SocketRoomService) {
        this.socketsService.getChatMessages().subscribe((message) => {
            this.messageHistory.push(message);
        });
    }

    get messages() {
        return this.messageHistory;
    }

    handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter' && input.value.length >= MAX_MESSAGE_LENGTH) {
            alert('Le message dépasse la taille maximale permise.');
        } else if (event.key === 'Enter') {
            this.currentMessage.message = input.value;
            this.currentMessage.author = this.player.name;
            this.currentMessage.timeStamp = new Date().toLocaleTimeString();
            this.socketsService.sendChatMessage(this.currentMessage);
            this.messageHistory.push(this.currentMessage);
            this.currentMessage = { message: '' } as ChatMessage;
        }
    }
}
