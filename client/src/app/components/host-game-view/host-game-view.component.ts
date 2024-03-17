import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Game, Player, Question } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
// import { PlayAreaComponent } from '../play-area/play-area.component';

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit {
    game: Game;
    currentQuestion: Question;
    players: Player[];
    stats: QCMStats[];
    statisticsData: { questionID: string; data: { data: number[]; text: string }[] }[] = [];

    private timer: number;

    constructor(
        public gameManagerService: GameManagerService,
        readonly timeService: TimeService,
        private socketService: SocketRoomService,
    ) {
        this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.players = players;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: any) => {
            console.log(stat);
            this.stats.push(stat);
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.START_TIMER).subscribe(() => {
            this.timer = this.gameManagerService.game.duration as number;
            this.timeService.startTimer(this.timer);
        });
    }

    get time(): number {
        return this.timeService.time;
    }
    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);
        this.currentQuestion = this.gameManagerService.firstQuestion();
        console.log(this.currentQuestion);
    }

    updateData(stat: QCMStats): void {
        for (const stats of this.statisticsData) {
            if (stats.questionID === stat.questionId) {
                if (stat.selected) {
                    stats.data[stat.choiceIndex - 1].data[0]++;
                } else {
                    stats.data[stat.choiceIndex - 1].data[0]--;
                }
                return;
            }
        }
        // const emptyStats = {
        //     questionId: (String = stat.questionId),
        //     data: { data: number[]; text: string }[],
        // };
        // for (let i = 1; i <= stat.choiceAmount; i++) {
        //     emptyStats.data.push({
        //         data: [0],
        //         text: i.toString(),
        //     });
        // }
    }
}
