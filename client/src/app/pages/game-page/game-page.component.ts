import { Component, OnInit } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    messages: string[] = [];
    constructor(public socketService: SocketRoomService) {}

    ngOnInit() {
        this.messages = [];
    }
}
