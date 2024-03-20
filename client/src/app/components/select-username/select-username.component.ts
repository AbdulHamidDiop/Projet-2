import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-select-username',
    templateUrl: './select-username.component.html',
    styleUrls: ['./select-username.component.scss'],
})
export class SelectUsernameComponent {
    constructor(
        private socket: SocketRoomService,
        private playerService: PlayerService,
        private snackBar: MatSnackBar,
    ) {
        this.socket.nameAvailable().subscribe(() => {
            this.snackBar.open('Le nom choisi est déjà utilisé', 'Fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
        });
    }

    sendUsername(input: HTMLInputElement) {
        const regex = /^[a-zA-Z]+$/;
        if (regex.test(input.value) && input.value.length > 1) {
            const username = input.value;
            this.socket.sendPlayerName(username);
            this.playerService.player.name = username;
        } else {
            this.snackBar.open('Le nom entré est invalide', 'fermer', {
                verticalPosition: 'top',
                duration: 5000,
            });
        }
    }
}
