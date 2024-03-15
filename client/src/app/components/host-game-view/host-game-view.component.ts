import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameManagerService } from '@app/services/game-manager.service';
import { TimeService } from '@app/services/time.service';
import { Game, Question } from '@common/game';
// import { PlayAreaComponent } from '../play-area/play-area.component';

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit {
    game: Game;
    currentQuestion: Question;
    countdown: number;

    constructor(
        public gameManagerService: GameManagerService,
        // public playArea: PlayAreaComponent,
        readonly timeService: TimeService,
        private route: ActivatedRoute,
    ) {}

    async ngOnInit(): Promise<void> {
        const gameID = this.route.snapshot.paramMap.get('id');
        if (gameID) {
            await this.gameManagerService.initialize(gameID);
        }
        this.currentQuestion = this.gameManagerService.nextQuestion();
        this.countdown = this.timeService.time;
        console.log(this.currentQuestion);
    }
}
