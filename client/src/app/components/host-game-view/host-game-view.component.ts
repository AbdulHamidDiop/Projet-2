import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Game, Player, Question } from '@common/game';
import { BarChartQuestionStats, QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
// import { PlayAreaComponent } from '../play-area/play-area.component';

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit {
    game: Game;
    timer: number;
    currentQuestion: Question;
    players: Player[];
    stats: QCMStats[];
    statisticsData: BarChartQuestionStats[] = [];
    questionIndex: number = 0;

    constructor(
        public gameManagerService: GameManagerService,
        readonly timeService: TimeService,
        private socketService: SocketRoomService,
    ) {
        this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.players = players;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    // export interface BarChartQuestionStats {
    //     questionID: string;
    //     data: BarChartChoiceStats[];
    // }

    // export interface BarChartChoiceStats {
    //     data: number[];
    //     label: string;
    // }

    get time(): number {
        return this.timeService.time;
    }
    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);
        this.currentQuestion = this.gameManagerService.nextQuestion();
        // this.countdown = this.timeService.time;

        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: unknown) => {
            console.log('Je m appel gabriel');
            this.updateData(stat as QCMStats);
            console.log(this.statisticsData);
        });
    }

    // export interface BarChartQuestionStats {
    //     questionID: string;
    //     data: BarChartChoiceStats[];
    // }

    // export interface BarChartChoiceStats {
    //     data: number[];
    //     label: string;
    // }

    updateData(stat: QCMStats): void {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]--;
            }
        } else {
            const barChartStat: BarChartQuestionStats = {
                questionID: stat.questionId,
                data: [],
            };
            for (let i = 1; i <= stat.choiceAmount; i++) {
                if (i - 1 === stat.choiceIndex) {
                    barChartStat.data.push({
                        data: [1],
                        label: i.toString(),
                    });
                } else {
                    barChartStat.data.push({
                        data: [0],
                        label: i.toString(),
                    });
                }
            }
            this.statisticsData.push(barChartStat);
        }
    }
}
