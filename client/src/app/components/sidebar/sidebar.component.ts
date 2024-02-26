import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketsService } from '@app/services/sockets.service';
import { ChatMessage } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnDestroy, OnInit {
    @ViewChild('chatContainer') private chatContainer: ElementRef;
    socketRoom = '0';
    userName = 'user';
    currentMessage: ChatMessage = {} as ChatMessage;
    private messageHistory: ChatMessage[] = [];
    private chatMessagesSubscription: Subscription;

    constructor(private socketsService: SocketsService) {
        this.ngOnInit();
        this.socketsService.joinRoom(nsp.CHAT_MESSAGES, this.socketRoom);
        this.chatMessagesSubscription = this.socketsService.listenForMessages(nsp.CHAT_MESSAGES, Events.CHAT_MESSAGE).subscribe((data: unknown) => {
            const message = data as ChatMessage;
            this.messageHistory.push(message);
            this.autoScroll();
        });
    }

    get messages() {
        return this.messageHistory;
    }

    async handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter') {
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

    ngOnInit(): void {
        this.messageHistory[0] = { message: 'Bienvenue dans le jeu QCM du projet LOG2990' } as ChatMessage;
        this.messageHistory[1] = {
            message: 'Vous pouvez aussi utiliser les touches du clavier pour sélectionner une réponse, et la touche Entrée pour confirmer',
        } as ChatMessage;
        this.messageHistory[2] = { message: 'Vous pouvez laisser un message ici' } as ChatMessage;
        this.messageHistory[3] = {
            message: 'Vous êtes dans la room 0, les messages écrits ici seront envoyés aux autres personnes dans la room',
        } as ChatMessage;
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
    }
}
