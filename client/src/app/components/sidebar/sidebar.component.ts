import { Component } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    currentMessage: string = '';
    private messageHistory: string[] = [''];
    constructor(private socket: SocketRoomService) {
        this.messageHistory[0] = 'Bienvenue dans le jeu QCM du projet LOG2990';
        this.messageHistory[1] = 'Vous pouvez répondre aux réponses en appuyant dessus puis en appuyant sur le bouton Confirmer';
        this.messageHistory[2] =
            'Vous pouvez aussi utiliser les touches du clavier pour sélectionner une réponse, et la touche Entrée pour confirmer';
        this.messageHistory[3] = 'Vous pouvez laisser un message ici';
        this.socket.getChatMessages().subscribe((message) => {
            if (this.messageHistory.includes(message)) {
                alert("Message déja dans l'historique");
            } else {
                this.messageHistory.push(message);
            }
        });
    }

    get messages() {
        return this.messageHistory;
    }

    handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter') {
            this.messageHistory.push(this.currentMessage);
            this.socket.sendChatMessage(this.currentMessage);
            this.currentMessage = '';
        } else {
            this.currentMessage = input.value;
        }
    }
}
