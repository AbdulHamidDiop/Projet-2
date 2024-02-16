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
            name: 'A',
            isHost: false,
            score: 0,
            bonusCount: 0,
        },
        {
            id: '2',
            name: 'A',
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
    }

    get player() {
        return this.players;
    }

    lock() {
        this.socket.lockRoom().subscribe((response) => {
            this.locked = response;
        });
    }

    unlock() {
        this.socket.unlockRoom().subscribe((response) => {
            this.locked = response;
        });
    }

    kickPlayer(name: string) {
        this.socket.kickPlayer(name);
    }
}
