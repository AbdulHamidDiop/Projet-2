import { Component, Input } from '@angular/core';
import { GameSession } from '@common/game-session';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss'],
})
export class SessionComponent {
    @Input() session: GameSession;

    formatDate(timeStarted: Date | undefined): string {
        if (timeStarted) {
            const date = new Date(timeStarted);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        return 'Sans date';
    }
}
