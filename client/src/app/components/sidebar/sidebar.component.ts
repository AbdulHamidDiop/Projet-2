import { Component } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    private messageHistory: string[] = [''];
    private messageHistorySize: number;
    private currentMessage: string = '';
    constructor() {
        this.messageHistory[0] = 'Bienvenue dans le jeu QCM du projet LOG2990';
        this.messageHistory[1] = 'Vous pouvez répondre aux réponses en appuyant dessus puis en appuyant sur le bouton Confirmer';
        this.messageHistory[2] =
            'Vous pouvez aussi utiliser les touches du clavier pour sélectionner une réponse, et la touche Entrée pour confirmer';
        this.messageHistory[3] = 'Vous pouvez laisser un message ici';
        this.messageHistorySize = 4;
    }

    get messages() {
        return this.messageHistory;
    }

    get displayMessage() {
        return this.currentMessage;
    }
    handleKeyboardPress(event: KeyboardEvent, input: HTMLInputElement) {
        if (event.key === 'Enter') {
            this.messageHistory[this.messageHistorySize++] = this.currentMessage;
            this.currentMessage = '';
        } else {
            this.currentMessage = input.value;
        }
    }
}
