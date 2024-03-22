import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Game, Player, Question } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';

const START_TIMER_DELAY = 500;
const SHOW_FEEDBACK_DELAY = 3000;

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit, OnDestroy {
    game: Game;
    timer: number;
    currentQuestion: Question;
    stats: QCMStats[];
    statisticsData: BarChartQuestionStats[] = [];
    barChartData: BarChartChoiceStats[] = [];
    questionIndex: number = 0;
    showCountDown: boolean = false;
    onLastQuestion: boolean = false;
    players: Player[] = [];

    private playerLeftSubscription: Subscription;
    private getPlayersSubscription: Subscription;
    private startTimerSubscription: Subscription;
    private stopTimerSubscription: Subscription;
    private nextQuestionSubscription: Subscription;
    private qcmStatsSubscription: Subscription;
    private timerEndedSubscription: Subscription;
    private endGameSubscription: Subscription;
    private updatePlayerSubscription: Subscription;

    constructor(
        public gameManagerService: GameManagerService,
        readonly timeService: TimeService,
        private route: ActivatedRoute,
        private router: Router,
        readonly socketService: SocketRoomService,
        readonly playerService: PlayerService,
    ) {
        this.getPlayersSubscription = this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.playerService.setGamePlayers(players);
        });

        this.startTimerSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.START_TIMER).subscribe(() => {
            this.timer = this.gameManagerService.game.duration as number;
            this.timeService.startTimer(this.timer);
        });

        this.stopTimerSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.STOP_TIMER).subscribe(() => {
            this.timeService.stopTimer();
        });

        this.nextQuestionSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.NEXT_QUESTION).subscribe(() => {
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
            setTimeout(
                () => {
                    this.questionIndex++;
                    this.currentQuestion = this.gameManagerService.goNextQuestion();
                    if (this.gameManagerService.endGame) {
                        this.onLastQuestion = true;
                    }
                    this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME);
                },
                2 * SHOW_FEEDBACK_DELAY + START_TIMER_DELAY,
            );
        });
    }

    get time(): number {
        return this.timeService.time;
    }

    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);

        this.currentQuestion = this.gameManagerService.firstQuestion();

        this.qcmStatsSubscription = this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: unknown) => {
            this.updateBarChartData(stat as QCMStats);
        });

        this.timerEndedSubscription = this.timeService.timerEnded.subscribe(() => {
            this.notifyNextQuestion();
        });

        this.endGameSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.END_GAME).subscribe(() => {
            this.openResultsPage();
        });

        this.updatePlayerSubscription = this.socketService
            .listenForMessages(Namespaces.GAME_STATS, Events.UPDATE_PLAYER)
            .subscribe((playerWithRoom) => {
                const { room, ...player } = playerWithRoom as Player & { room: string };
                this.playerService.addGamePlayers(player as Player);
            });

        this.playerLeftSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.PLAYER_LEFT).subscribe((data: unknown) => {
            const username = (data as { user: string }).user;
            this.players = this.players.filter((p) => p.name !== username);
            if (this.players.length === 0) {
                this.socketService.endGame();
            }
        });

        window.addEventListener('hashchange', this.onLocationChange);
        window.addEventListener('popstate', this.onLocationChange);
    }

    async updateBarChartData(stat: QCMStats): Promise<void> {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected && this.statisticsData[index].data[stat.choiceIndex].data[0] > 0) {
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

    goNextQuestion(): void {
        this.questionIndex++;
        this.currentQuestion = this.gameManagerService.goNextQuestion();
    }

    showResults(): void {
        this.socketService.sendMessage(Events.SHOW_RESULTS, Namespaces.GAME);
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
    }

    notifyNextQuestion() {
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
        this.choseNextQuestion();
    }

    openCountDownModal(): void {
        this.showCountDown = true;
    }

    onCountDownModalClosed(): void {
        this.showCountDown = false;
    }
    notifyEndGame() {
        this.showResults();
        setTimeout(() => {
            this.socketService.sendMessage(Events.END_GAME, Namespaces.GAME);
        }, SHOW_FEEDBACK_DELAY);
    }

    openResultsPage(): void {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);

        const gameId = this.route.snapshot.paramMap.get('id');
        if (gameId) {
            this.router.navigate(['/game', gameId, 'results']);
        }
        this.socketService.sendMessage(Events.GAME_RESULTS, Namespaces.GAME_STATS, this.statisticsData);
        this.socketService.sendMessage(Events.GET_PLAYERS, Namespaces.GAME_STATS, this.playerService.playersInGame);
    }

    onLocationChange = () => {
        this.socketService.endGame();
    };

    choseNextQuestion(): void {
        if (this.gameManagerService.endGame) {
            this.showResults();
            this.onLastQuestion = true;
        } else if (!this.gameManagerService.endGame) {
            this.socketService.sendMessage(Events.NEXT_QUESTION, Namespaces.GAME);
        }
    }

    ngOnDestroy() {
        this.timeService.stopTimer();
        this.gameManagerService.reset();

        this.playerLeftSubscription.unsubscribe();
        this.getPlayersSubscription.unsubscribe();
        this.startTimerSubscription.unsubscribe();
        this.stopTimerSubscription.unsubscribe();
        this.nextQuestionSubscription.unsubscribe();
        this.qcmStatsSubscription.unsubscribe();
        this.timerEndedSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
        this.updatePlayerSubscription.unsubscribe();

        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
    }
}
