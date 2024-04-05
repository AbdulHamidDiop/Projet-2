import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketRoomService } from '@app/services/socket-room.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
    constructor(
        private router: Router,
        private socketService: SocketRoomService,
    ) {}

    createGame(): void {
        this.router.navigate(['/createGame']);
        this.socketService.endGame();
    }

    home(): void {
        this.router.navigate(['/']);
        this.socketService.endGame();
    }
}
