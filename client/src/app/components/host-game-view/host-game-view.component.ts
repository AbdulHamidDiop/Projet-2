/* eslint-disable max-lines */
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartComponent } from '@app/components/bar-chart/bar-chart.component';
import { QRL_TIMER } from '@app/components/play-area/const';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Player, Type } from '@common/game';
import { BarChartQuestionStats, QCMStats, QRLAnswer, QRLGrade, QRLStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';
import { FULL_GRADE_MULTIPLER, HALF_GRADE_MULTIPLER, RECEIVE_ANSWERS_DELAY, SHOW_FEEDBACK_DELAY, ZERO_GRADE_MULTIPLER } from './const';
import { HostGameViewLogic } from './host-game-view-logic';
import { icons } from './icons';

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(BarChartComponent) appBarChart: BarChartComponent;
    // game: Game;
    // timer: number;
    // currentQuestion: Question;
    // stats: QCMStats[];
    // statisticsData: BarChartQuestionStats[] = [];
    // barChartData: BarChartChoiceStats[] = [];
    // gradingAnswers: boolean = false;
    // currentQRLAnswer: QRLAnswer;
    // qRLAnswers: QRLAnswer[] = [];
    // questionIndex: number = 0;
    // showCountDown: boolean = false;
    // onLastQuestion: boolean = false;
    // playersLeft: number;
    // displayPlayerList = true;
    // unitTesting: boolean = false;
    // disableControls: boolean = false;
    // disableNextQuestion: boolean = true;
    // nConfirmations: number = 0;
    // questionLoaded: boolean = false;
    // inPanicMode: boolean = false;
    // timerPaused: boolean = false;
    logic: HostGameViewLogic = new HostGameViewLogic();
    playerLeftSubscription: Subscription;
    icons = icons;
    // Tous les paramètres du constructeur sont nécessaires
    // au bon fonctionnement de la classe.
    // eslint-disable-next-line max-params
    constructor(
        public gameManagerService: GameManagerService,
        readonly timeService: TimeService,
        private route: ActivatedRoute,
        private router: Router,
        readonly socketService: SocketRoomService,
        readonly playerService: PlayerService,
        private snackBar: MatSnackBar,
    ) {
        this.timeService.pauseFlag = false;
        this.logic.questionLoaded = false;
        this.logic.playersLeft = this.playerService.nActivePlayers();
        this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.playerService.playersInGame = players;
        });
    }
    get time(): number {
        return this.timeService.time;
    }
    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);
        this.logic.currentQuestion = this.gameManagerService.firstQuestion();
        this.logic.timer = this.logic.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;
        this.setSubscriptions();
        this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.logic.timer });
        this.timeService.deactivatePanicMode();
        window.addEventListener('hashchange', this.onLocationChange);
        window.addEventListener('popstate', this.onLocationChange);
    }

    ngAfterViewInit(): void {
        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: unknown) => {
            this.updateBarChartData(stat as QCMStats);
            this.updatePlayerFromServer(stat as QCMStats);
        });
    }
    async updateBarChartData(stat: QCMStats): Promise<void> {
        const index = this.logic.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.selected) {
                this.logic.statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected && this.logic.statisticsData[index].data[stat.choiceIndex].data[0] > 0) {
                this.logic.statisticsData[index].data[stat.choiceIndex].data[0]--;
            }
            this.logic.barChartData = this.logic.statisticsData[this.logic.questionIndex].data;
            this.appBarChart.datasets = this.logic.barChartData;
            this.appBarChart.labels = this.logic.currentQuestion.text;
            this.appBarChart.updateData();
        } else {
            const barChartStat: BarChartQuestionStats = {
                questionID: stat.questionId,
                data: [],
            };
            const correction: Feedback[] = await this.gameManagerService.getFeedBack(
                this.logic.currentQuestion.id,
                this.logic.currentQuestion.choices?.map((choice) => choice.text) || [],
            );
            let text = 'unknown';
            for (let i = 0; i < stat.choiceAmount; i++) {
                if (this.logic.currentQuestion.choices) {
                    text = this.logic.currentQuestion.choices[i].text;
                }
                barChartStat.data.push({
                    data: i === stat.choiceIndex ? [1] : [0],
                    label: text,
                    backgroundColor: correction[i].status === 'correct' ? '#4CAF50' : '#FF4C4C',
                });
            }
            this.logic.statisticsData.push(barChartStat);
        }
        if (this.logic.statisticsData) {
            this.logic.barChartData = this.logic.statisticsData[this.logic.questionIndex]?.data;
            this.appBarChart.datasets = this.logic.barChartData;
            this.appBarChart.labels = this.logic.currentQuestion.text;
            this.appBarChart.updateData();
        }
    }
    async updateQRLBarChartData(stat: QRLStats): Promise<void> {
        const index = this.logic.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.edited) {
                this.logic.statisticsData[index].data[0].data[0]++;
            } else if (this.logic.statisticsData[index].data[0].data[0] > 0) {
                this.logic.statisticsData[index].data[0].data[0]--;
            }
            this.logic.statisticsData[index].data[1].data[0] = this.logic.playersLeft - this.logic.statisticsData[index].data[0].data[0];
        } else {
            const initialCount = stat.edited ? 1 : 0;
            this.logic.statisticsData.push({
                questionID: stat.questionId,
                data: [
                    {
                        data: [initialCount],
                        label: 'Nombre de personnes ayant modifié leur réponse dans les 5 dernières secondes',
                        backgroundColor: '#4CAF50',
                    },
                    {
                        data: [this.logic.playersLeft - initialCount],
                        label: "Nombre de personnes n'ayant pas modifié leur réponse dans les 5 dernières secondes",
                        backgroundColor: '#FFCE56',
                    },
                ],
            });
        }
        this.logic.barChartData = this.logic.statisticsData[this.logic.questionIndex]?.data;
        this.appBarChart.datasets = this.logic.barChartData;
        this.appBarChart.labels = this.logic.currentQuestion.text;
        this.appBarChart.updateData();
    }
    updateQRLGradeData(multiplier: number): void {
        let barIndex;
        switch (multiplier) {
            case ZERO_GRADE_MULTIPLER:
                barIndex = 0;
                break;
            case HALF_GRADE_MULTIPLER:
                barIndex = 1;
                break;
            case FULL_GRADE_MULTIPLER:
                barIndex = 2;
                break;
            default:
                return;
        }
        this.logic.statisticsData[this.logic.questionIndex].data[barIndex].data[0]++;
    }
    gradeAnswers(): void {
        this.logic.disableControls = true;
        this.socketService.sendMessage(Events.SEND_QRL_ANSWER, Namespaces.GAME);
        this.timeService.stopTimer();
        setTimeout(() => {
            this.logic.gradingAnswers = true;
            this.logic.qRLAnswers.sort((a, b) => a.author.localeCompare(b.author));
            this.logic.currentQRLAnswer = this.logic.qRLAnswers[0];
        }, RECEIVE_ANSWERS_DELAY);
        this.logic.statisticsData[this.logic.questionIndex] = {
            questionID: this.logic.currentQuestion.id,
            data: [
                { data: [0], label: 'nombre de personnes ayant eu 0', backgroundColor: '#FF4C4C' },
                { data: [0], label: 'nombre de personnes ayant eu la moitié des points', backgroundColor: '#FFCE56' },
                { data: [0], label: 'nombre de personnes ayant eu la totalité des points', backgroundColor: '#4CAF50' },
            ],
        };
    }
    sendQRLGrade(multiplier: number): void {
        this.updateQRLGradeData(multiplier);
        const qrlGrade: QRLGrade = {
            questionId: this.logic.currentQuestion.id,
            author: this.logic.currentQRLAnswer.author,
            grade: multiplier * this.logic.currentQuestion.points,
            multiplier,
        };
        this.socketService.sendMessage(Events.QRL_GRADE, Namespaces.GAME, qrlGrade);
        this.logic.qRLAnswers.shift();
        this.logic.currentQRLAnswer = this.logic.qRLAnswers[0];
        if (this.logic.qRLAnswers.length === 0) {
            if (this.gameManagerService.onLastQuestion()) {
                this.notifyEndGame();
                return;
            }
            this.logic.gradingAnswers = false;
            this.notifyNextQuestion();
        }
    }
    showResults(): void {
        this.socketService.sendMessage(Events.SHOW_RESULTS, Namespaces.GAME);
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
    }
    notifyNextQuestion() {
        if (!this.logic.statisticsData[this.logic.questionIndex]) {
            this.logic.statisticsData[this.logic.questionIndex] = {
                questionID: this.logic.currentQuestion.id,
                data: [],
            };
        }
        this.logic.disableControls = true;
        this.deactivatePanicMode();
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
        this.choseNextQuestion();
        this.logic.questionLoaded = false;
    }

    onNextQuestionReceived(): void {
        this.logic.questionIndex++;
        this.logic.currentQuestion = this.gameManagerService.goNextQuestion();
        this.logic.gradingAnswers = false;
        this.logic.qRLAnswers = [];
        this.logic.disableControls = false;
        this.logic.nConfirmations = 0;
        this.logic.disableNextQuestion = true;
        if (this.gameManagerService.onLastQuestion()) {
            this.logic.onLastQuestion = true;
        }
        this.logic.timer = this.logic.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;
        this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.logic.timer });
        if (this.logic.currentQuestion.type === Type.QRL) {
            const qrlStat: QRLStats = {
                questionId: this.logic.currentQuestion.id,
                edited: false,
            };
            for (let i = 1; i <= this.logic.playersLeft; i++) {
                this.updateQRLBarChartData(qrlStat);
            }
        }
    }
    sendTimerControlMessage(): void {
        this.logic.timerPaused = !this.logic.timerPaused;
        this.socketService.sendMessage(Events.PAUSE_TIMER, Namespaces.GAME);
    }
    activatePanicMode(): void {
        this.logic.inPanicMode = true;
        this.socketService.sendMessage(Events.PANIC_MODE, Namespaces.GAME, { type: this.logic.currentQuestion.type });
    }
    deactivatePanicMode(): void {
        this.logic.inPanicMode = false;
        this.socketService.sendMessage(Events.PANIC_MODE_OFF, Namespaces.GAME);
    }
    openCountDownModal(): void {
        this.logic.showCountDown = true;
    }
    onCountDownModalClosed(): void {
        this.logic.showCountDown = false;
    }
    notifyEndGame() {
        this.showResults();
        this.socketService.sendMessage(Events.END_GAME, Namespaces.GAME);
    }
    updatePlayerFromServer(stats: QCMStats) {
        for (const player of this.playerService.playersInGame) {
            if (stats.player && player.name === stats.player.name) {
                player.score = stats.player.score;
            }
        }
    }
    openResultsPage(): void {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
        const RESPONSE_FROM_SERVER_DELAY = 1300;
        const gameId = this.route.snapshot.paramMap.get('id');
        if (gameId) {
            setTimeout(() => {
                this.socketService.showingResults = true;
                this.router.navigate(['/game', gameId, 'results']);
            }, RESPONSE_FROM_SERVER_DELAY);
        }
    }
    onLocationChange = () => {
        this.socketService.endGame();
    };
    choseNextQuestion(): void {
        this.socketService.sendMessage(Events.NEXT_QUESTION, Namespaces.GAME);
        if (!this.logic.questionLoaded) {
            this.logic.questionLoaded = true;
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
            setTimeout(() => {
                this.onNextQuestionReceived();
            }, 2 * SHOW_FEEDBACK_DELAY);
        }
    }
    handleTimerEnd(): void {
        if (this.logic.onLastQuestion) {
            this.timeService.stopTimer();
            this.notifyEndGame();
        } else if (this.logic.currentQuestion.type === Type.QCM) {
            this.notifyNextQuestion();
        } else if (this.logic.currentQuestion.type === Type.QRL) {
            this.gradeAnswers();
        }
    }
    onPlayerLeft(data: { user: string }): void {
        const username = (data as { user: string }).user;
        const player = this.playerService.playersInGame.find((p) => p.name === username);
        if (player) {
            player.leftGame = true;
        }
        this.logic.playersLeft = this.playerService.nActivePlayers();
        if (this.logic.playersLeft === 0) {
            this.snackBar.open('Tous les joueurs ont quitté la partie, la partie sera interrompue sous peu', 'Fermer', {
                verticalPosition: 'top',
                duration: 3000,
            });
            setTimeout(() => {
                this.socketService.endGame();
            }, SHOW_FEEDBACK_DELAY);
        }
        if (this.logic.currentQuestion.type === Type.QRL) {
            const qrlStat: QRLStats = {
                questionId: this.logic.currentQuestion.id,
                edited: false,
            };
            this.updateQRLBarChartData(qrlStat);
        }
    }
    ngOnDestroy() {
        this.timeService.stopTimer();
        this.logic.timerPaused = false;
        this.deactivatePanicMode();
        this.timeService.deactivatePanicMode();
        this.gameManagerService.reset();
        this.playerLeftSubscription?.unsubscribe();
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
    }
    private setSubscriptions(): void {
        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QRL_STATS).subscribe((stat: unknown) => {
            this.updateQRLBarChartData(stat as QRLStats);
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.QRL_ANSWER).subscribe((answer: unknown) => {
            this.logic.qRLAnswers.push(answer as QRLAnswer);
        });
        this.timeService.timerEnded.subscribe(() => {
            this.handleTimerEnd();
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.END_GAME).subscribe(() => {
            this.openResultsPage();
        });
        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.UPDATE_PLAYER).subscribe((playerWithRoom) => {
            const { ...player } = playerWithRoom as Player & { room: string };
            this.playerService.addGamePlayers(player as Player);
        });
        this.playerLeftSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.PLAYER_LEFT).subscribe((data: unknown) => {
            this.onPlayerLeft(data as { user: string });
        });
        this.socketService.listenForMessages(Namespaces.GAME, Events.PLAYER_CONFIRMED).subscribe(() => {
            this.logic.nConfirmations++;
            if (this.logic.nConfirmations === this.logic.playersLeft) {
                this.logic.disableNextQuestion = false;
            }
        });
    }
}
