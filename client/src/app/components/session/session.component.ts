import { Component, Input } from '@angular/core';
import { GameSession } from '@common/game-session';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent {
    @Input() session: GameSession;
}
