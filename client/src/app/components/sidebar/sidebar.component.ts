import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { ChatMessage, MAX_MESSAGE_LENGTH } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';
import { PlayerService } from './../../services/player.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnDestroy, OnInit {
    @Input() player: Player = {} as Player;
    @ViewChild('chatContainer') private chatContainer: ElementRef;
    currentMessage: ChatMessage = { message: '' } as ChatMessage;
    private messageHistory: ChatMessage[] = [];
    private chatMessagesSubscription: Subscription;
    private chatHistorySubscription: Subscription;

    constructor(
        private socketsService: SocketRoomService,
        private playerService: PlayerService,
    ) {
        this.player = this.playerService.player;
        this.socketsService.getChatMessages().subscribe(async (message) => {
            if (message.author === 'room') {
                this.socketsService.room = message.message;
                console.log(message.message);
                try {
                    await this.socketsService.joinAllNamespaces(message.message);
                    // Proceed to the next step after successful connection and room joining
                } catch (error) {
                    console.error('Failed to join room in all namespaces', error);
                    // Handle error (e.g., show error message to the user)
                }
                return;
            }
            this.messageHistory.push(message);
            this.autoScroll();
        });

        this.chatHistorySubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_HISTORY).subscribe((data: unknown) => {
            const chatHistory = data as ChatMessage[];
            this.messageHistory.concat(chatHistory);
            this.autoScroll();
        });

        this.chatMessagesSubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_MESSAGE).subscribe((data: unknown) => {
            const message = data as ChatMessage;
            this.messageHistory.push(message);
            console.log('messageHistory', this.messageHistory);
            this.autoScroll();
        });
        // this.socketsService.sendMessage(Events.CHAT_HISTORY, nsp.CHAT_MESSAGES);
    }

    get messages() {
        return this.messageHistory;
    }

    handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter' && this.currentMessage.message) {
            this.currentMessage.author = this.player.name;
            this.currentMessage.timeStamp = new Date().toLocaleTimeString();
            this.socketsService.sendChatMessage(this.currentMessage);
            this.messageHistory.push(this.currentMessage);
            this.currentMessage = {
                message: '',
                author: this.player.name,
                timeStamp: new Date().toLocaleTimeString(),
            };
            this.autoScroll();
        } else if (this.currentMessage.message.length <= MAX_MESSAGE_LENGTH) {
            this.currentMessage.message = input.value;
        }
    }

    autoScroll(): void {
        setTimeout(() => {
            try {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            } catch (err) {
                return;
            }
        }, 0);
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit(): void {
        // this.socketsService.sendMessage(Events.CHAT_HISTORY, nsp.CHAT_MESSAGES);
    }

    ngOnDestroy(): void {
        this.chatMessagesSubscription.unsubscribe();
        this.chatHistorySubscription.unsubscribe();
    }
}

// import { Component, Input } from '@angular/core';
// import { SocketRoomService } from '@app/services/socket-room.service';
// import { Player } from '@common/game';
// import { ChatMessage, MAX_MESSAGE_LENGTH } from '@common/message';

// @Component({
//     selector: 'app-sidebar',
//     templateUrl: './sidebar.component.html',
//     styleUrls: ['./sidebar.component.scss'],
// })
// export class SidebarComponent {
//     @Input() player: Player = {} as Player;
//     currentMessage: ChatMessage = { message: '' } as ChatMessage;
//     private messageHistory: ChatMessage[] = [];

//     constructor(private socketsService: SocketRoomService) {
//         this.socketsService.getChatMessages().subscribe((message) => {
//             this.messageHistory.push(message);
//         });
//     }

//     get messages() {
//         return this.messageHistory;
//     }

//     handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
//         if (event.key === 'Enter' && input.value.length >= MAX_MESSAGE_LENGTH) {
//             alert('Le message dépasse la taille maximale permise.');
//         } else if (event.key === 'Enter') {
//             this.currentMessage.message = input.value;
//             this.currentMessage.author = this.player.name;
//             this.currentMessage.timeStamp = new Date().toLocaleTimeString();
//             this.socketsService.sendChatMessage(this.currentMessage);
//             this.messageHistory.push(this.currentMessage);
//             this.currentMessage = { message: '' } as ChatMessage;
//         }
//     }
// }
