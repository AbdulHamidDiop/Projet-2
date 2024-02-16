import { Component } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent {
    counter: number = 0;
    locked: boolean = false;
    name: string = 'admin';
    players: Player[] = [
        {
            id: '0',
            name: 'A',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
        {
            id: '1',
            name: 'B',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
        {
            id: '2',
            name: 'admin',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
    ];
    constructor(private socket: SocketRoomService) {
        this.socket.getPlayers().subscribe((players) => {
            this.counter++;
            this.players = players;
        });

        this.socket.lockSubscribe().subscribe((response) => {
            if (response) {
                this.locked = true;
                alert('Room is locked');
            }
        });

        this.socket.unlockSubscribe().subscribe((response) => {
            if (response) {
                this.locked = false;
                alert('Room is unlocked');
            }
        });

        this.socket.kickSubscribe().subscribe((response) => {
            if (response === this.name) {
                alert('Vous avez été exclu');
            }
        });
    }

    get player() {
        return this.players;
    }

    lock() {
        this.socket.lockRoom(this.name);
    }

    unlock() {
        this.socket.unlockRoom(this.name);
    }

    kickPlayer(player: string) {
        this.socket.kickPlayer(this.name, player);
    }
}
