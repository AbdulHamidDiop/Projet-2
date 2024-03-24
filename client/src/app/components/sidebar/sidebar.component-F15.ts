import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SocketsService } from '@app/services/sockets.service';
import { ChatMessage } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnDestroy {
    @ViewChild('chatContainer') private chatContainer: ElementRef;
    socketRoom = '0';
    userName = 'user';
    currentMessage: ChatMessage = {} as ChatMessage;
    private messageHistory: ChatMessage[] = [];
    private chatMessagesSubscription: Subscription;
    private chatHistorySubscription: Subscription;

    constructor(private socketsService: SocketsService) {
        this.socketsService.joinRoom(nsp.CHAT_MESSAGES, this.socketRoom);
        this.chatMessagesSubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_MESSAGE).subscribe((data: unknown) => {
            const message = data as ChatMessage;
            this.messageHistory.push(message);
            this.autoScroll();
        });

        this.chatHistorySubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_HISTORY).subscribe((data: unknown) => {
            const chatHistory = data as ChatMessage[];
            this.messageHistory = chatHistory;
            this.autoScroll();
        });
        this.socketsService.sendMessage(Events.CHAT_HISTORY, nsp.CHAT_MESSAGES, this.socketRoom);
    }

    get messages() {
        return this.messageHistory;
    }

    async handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter' && this.currentMessage.message) {
            this.currentMessage.author = this.userName;
            this.currentMessage.timeStamp = new Date().toLocaleTimeString();

            this.socketsService.sendMessage(Events.CHAT_MESSAGE, nsp.CHAT_MESSAGES, this.socketRoom, this.currentMessage);
            this.messageHistory.push(this.currentMessage);
            this.currentMessage = {} as ChatMessage;
            this.autoScroll();
        } else {
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

    ngOnDestroy(): void {
        this.chatMessagesSubscription.unsubscribe();
        this.chatHistorySubscription.unsubscribe();
    }
}
