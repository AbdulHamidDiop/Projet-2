import { Component, OnInit } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    messages: string[] = [];
    player: Player;
    constructor(
        public socketService: SocketRoomService,
        private playerService: PlayerService,
    ) {
        this.player = this.playerService.player;
        this.socketService.getProfile().subscribe((player) => {
            this.player = player;
        });
    }

    ngOnInit() {
        this.messages = [];
    }
}
