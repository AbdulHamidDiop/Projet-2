import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { ChatMessage, MAX_MESSAGE_LENGTH, SystemMessages as sysmsg } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnDestroy {
    @Input() player: Player = {} as Player;
    @ViewChild('chatContainer') private chatContainer: ElementRef;
    currentMessage: ChatMessage = { message: '' } as ChatMessage;
    messageHistory: ChatMessage[] = [];
    private chatMessagesSubscription: Subscription;
    private chatHistorySubscription: Subscription;
    private globalChatSubscription: Subscription;

    constructor(
        readonly socketsService: SocketRoomService,
        readonly playerService: PlayerService,
    ) {
        this.player = this.playerService.player;
        this.globalChatSubscription = this.socketsService.getChatMessages().subscribe(async (message) => {
            if (message.author === 'room') {
                this.socketsService.room = message.message;
                try {
                    await this.socketsService.joinAllNamespaces(message.message);
                } catch (error) {
                    return;
                }
                return;
            }
            this.messageHistory.push(message);
            this.autoScroll();
        });

        this.chatHistorySubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_HISTORY).subscribe((data: unknown) => {
            this.purgeChat();
            const chatHistory = data as ChatMessage[];
            this.messageHistory = this.messageHistory.concat(chatHistory);
            this.autoScroll();
        });

        this.chatMessagesSubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_MESSAGE).subscribe((data: unknown) => {
            const message = data as ChatMessage;
            this.messageHistory.push(message);
            this.autoScroll();
        });
        this.socketsService.sendMessage(Events.CHAT_HISTORY, nsp.CHAT_MESSAGES);
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

    purgeChat(): void {
        this.messageHistory = this.messageHistory.filter((message) => message.author !== sysmsg.AUTHOR);
    }

    ngOnDestroy(): void {
        this.chatMessagesSubscription.unsubscribe();
        this.chatHistorySubscription.unsubscribe();
        this.globalChatSubscription.unsubscribe();
    }
}
