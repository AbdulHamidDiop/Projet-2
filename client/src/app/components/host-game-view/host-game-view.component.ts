import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Game, Player, Question } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
// import { PlayAreaComponent } from '../play-area/play-area.component';

const START_TIMER_DELAY = 500;
const SHOW_FEEDBACK_DELAY = 3000;

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
    barChartData: BarChartChoiceStats[] = [];
    questionIndex: number = 0;
    showCountDown: boolean = false;

    constructor(
        public gameManagerService: GameManagerService,
        readonly timeService: TimeService,
        private socketService: SocketRoomService,
    ) {
        this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.players = players;
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.START_TIMER).subscribe(() => {
            this.timer = this.gameManagerService.game.duration as number;
            this.timeService.startTimer(this.timer);
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.STOP_TIMER).subscribe(() => {
            this.timeService.stopTimer();
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.NEXT_QUESTION).subscribe(() => {
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
            setTimeout(() => {
                this.currentQuestion = this.gameManagerService.nextQuestion();
                this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME);
            }, 2 * SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
           
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    get time(): number {
        return this.timeService.time;
    }

    // export interface BarChartQuestionStats {
    //     questionID: string;
    //     data: BarChartChoiceStats[];
    // }

    // export interface BarChartChoiceStats {
    //     data: number[];
    //     label: string;
    // }

    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);

        this.currentQuestion = this.gameManagerService.firstQuestion();

        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: unknown) => {
            this.updateBarChartData(stat as QCMStats);
        });

        this.timeService.timerEnded.subscribe(() => {
            this.notifyNextQuestion();
          });
    }

    async updateBarChartData(stat: QCMStats): Promise<void> {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]--;
            }
            this.barChartData = this.statisticsData[this.questionIndex].data;
        } else {
            const barChartStat: BarChartQuestionStats = {
                questionID: stat.questionId,
                data: [],
            };
            const correction: Feedback[] = await this.gameManagerService.getFeedBack(
                this.currentQuestion.id,
                this.currentQuestion.choices.map((choice) => choice.text),
            );

            for (let i = 0; i < stat.choiceAmount; i++) {
                barChartStat.data.push({
                    data: i === stat.choiceIndex ? [1] : [0],
                    label: this.currentQuestion.choices[i].text,
                    backgroundColor: correction[i].status === 'correct' ? '#4CAF50' : '#FF4C4C',
                });
            }
            this.statisticsData.push(barChartStat);
        }
        this.barChartData = this.statisticsData[this.questionIndex].data;
    }

    nextQuestion(): void {
        this.questionIndex++;
        this.currentQuestion = this.gameManagerService.nextQuestion();
    }

    showResults(): void {
        this.socketService.sendMessage(Events.SHOW_RESULTS, Namespaces.GAME);
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
    }

    notifyNextQuestion() {
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
        this.socketService.sendMessage(Events.NEXT_QUESTION, Namespaces.GAME);
    }

    openCountDownModal(): void {
        this.showCountDown = true;
    }

    onCountDownModalClosed(): void {
        this.showCountDown = false;
    }
    notifyEndGame() {
        this.socketService.sendMessage(Events.LEAVE_ROOM, Namespaces.GAME);
        this.socketService.sendMessage(Events.END_GAME, Namespaces.GAME);
    }
}
