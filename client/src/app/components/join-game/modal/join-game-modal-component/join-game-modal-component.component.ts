import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-join-game-modal-component',
    templateUrl: './join-game-modal-component.component.html',
    styleUrls: ['./join-game-modal-component.component.scss'],
})
export class JoinGameModalComponent {
    pin: string = '';
    username: string = '';

    constructor(
        public dialogRef: MatDialogRef<JoinGameModalComponent>,
        readonly router: Router,
        readonly socketService: SocketClientService,
    ) {
        this.connectToSocket();
    }
    connectToSocket() {
        this.socketService.connect();
    }

    joinRoom(room: string) {
        this.socketService.send('joinRoom', room);
    }

    createRoom() {
        this.socketService.send('createRoom');
    }

    onJoinButtonClick() {
        Promise.all([this.validatePIN(), this.validateName()]).then(([isValidPIN, isValidName]) => {
            if (!isValidPIN) {
                alert("Le PIN sélectionné n'existe pas ou la partie est déjà en cours.");
                return;
            }
            if (!isValidName) {
                alert('Le nom sélectionné est déjà utilisé ou a été banni.');
                return;
            }
            this.socketService.send('joinRoom', this.pin);
            this.dialogRef.close();
            this.router.navigate(['/waiting']);
        });
    }

    async validatePIN(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.socketService.send('validateRoom', this.pin, (res: { isValid: boolean }) => {
                resolve(res.isValid);
            });
        });
    }

    async validateName(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const nameLower = this.username.toLowerCase();
            if (nameLower === 'organisateur') {
                resolve(false);
                return;
            }
            this.socketService.send('validateName', { username: this.username, pin: this.pin }, (res: { isValid: boolean }) => {
                resolve(res.isValid);
            });
        });
    }
}
