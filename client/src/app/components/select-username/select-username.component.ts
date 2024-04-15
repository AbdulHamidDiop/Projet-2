import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { START_GAME_DELAY } from '@common/consts';

@Component({
    selector: 'app-select-username',
    templateUrl: './select-username.component.html',
    styleUrls: ['./select-username.component.scss'],
})
export class SelectUsernameComponent implements AfterViewInit {
    @ViewChild('input') nameField!: ElementRef;

    constructor(
        private socket: SocketRoomService,
        private playerService: PlayerService,
        private snackBar: MatSnackBar,
    ) {
        this.socket.onNameNotAvailable().subscribe(() => {
            this.snackBar.open('Le nom choisi est déjà utilisé', 'Fermer', {
                verticalPosition: 'top',
                duration: START_GAME_DELAY,
            });
        });

        this.socket.onNameBanned().subscribe(() => {
            this.snackBar.open('Le nom choisi est banni et ne peut-être utilisé', 'Fermer', {
                verticalPosition: 'top',
                duration: START_GAME_DELAY,
            });
        });
    }

    sendUsername(input: HTMLInputElement) {
        const regex = /^[a-zA-Z0-9]+$/;
        if (regex.test(input.value) && input.value.length > 1) {
            const username = input.value.charAt(0).toUpperCase() + input.value.slice(1).toLowerCase();
            this.socket.sendPlayerName(username);
            this.playerService.player.name = username;
        } else {
            this.snackBar.open('Le nom entré est invalide', 'fermer', {
                verticalPosition: 'top',
                duration: START_GAME_DELAY,
            });
        }
    }

    ngAfterViewInit() {
        this.nameField.nativeElement.focus();
    }
}
