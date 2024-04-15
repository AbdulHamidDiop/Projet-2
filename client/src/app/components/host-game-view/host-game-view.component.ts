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
import { Game, Player, Question, Type } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats, QRLAnswer, QRLGrade, QRLStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';
import { FULL_GRADE_MULTIPLER, HALF_GRADE_MULTIPLER, RECEIVE_ANSWERS_DELAY, SHOW_FEEDBACK_DELAY, ZERO_GRADE_MULTIPLER } from './const';
import { icons } from './icons';

@Component({
    selector: 'app-host-game-view',
    templateUrl: './host-game-view.component.html',
    styleUrls: ['./host-game-view.component.scss'],
})
export class HostGameViewComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(BarChartComponent) appBarChart: BarChartComponent;
    game: Game;
    timer: number;
    currentQuestion: Question;
    stats: QCMStats[];
    statisticsData: BarChartQuestionStats[] = [];
    barChartData: BarChartChoiceStats[] = [];
    gradingAnswers: boolean = false;
    currentQRLAnswer: QRLAnswer;
    qRLAnswers: QRLAnswer[] = [];
    questionIndex: number = 0;
    showCountDown: boolean = false;
    onLastQuestion: boolean = false;
    playersLeft: number;
    displayPlayerList = true;
    unitTesting: boolean = false;
    disableControls: boolean = false;
    disableNextQuestion: boolean = true;
    nConfirmations: number = 0;
    questionLoaded: boolean = false;
    inPanicMode: boolean = false;
    timerPaused: boolean = false;
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
        this.questionLoaded = false;
        this.playersLeft = this.playerService.nActivePlayers();
        this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.playerService.playersInGame = players;
        });
    }
    get time(): number {
        return this.timeService.time;
    }
    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);
        this.currentQuestion = this.gameManagerService.firstQuestion();
        this.timer = this.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;
        this.setSubscriptions();
        this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.timer });
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
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.selected) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected && this.statisticsData[index].data[stat.choiceIndex].data[0] > 0) {
                this.statisticsData[index].data[stat.choiceIndex].data[0]--;
            }
            this.barChartData = this.statisticsData[this.questionIndex].data;
            this.appBarChart.datasets = this.barChartData;
            this.appBarChart.labels = this.currentQuestion.text;
            this.appBarChart.updateData();
        } else {
            const barChartStat: BarChartQuestionStats = {
                questionID: stat.questionId,
                data: [],
            };
            const correction: Feedback[] = await this.gameManagerService.getFeedBack(
                this.currentQuestion.id,
                this.currentQuestion.choices?.map((choice) => choice.text) || [],
            );
            let text = 'unknown';
            for (let i = 0; i < stat.choiceAmount; i++) {
                if (this.currentQuestion.choices) {
                    text = this.currentQuestion.choices[i].text;
                }
                barChartStat.data.push({
                    data: i === stat.choiceIndex ? [1] : [0],
                    label: text,
                    backgroundColor: correction[i].status === 'correct' ? '#4CAF50' : '#FF4C4C',
                });
            }
            this.statisticsData.push(barChartStat);
        }
        if (this.statisticsData) {
            this.barChartData = this.statisticsData[this.questionIndex]?.data;
            this.appBarChart.datasets = this.barChartData;
            this.appBarChart.labels = this.currentQuestion.text;
            this.appBarChart.updateData();
        }
    }
    async updateQRLBarChartData(stat: QRLStats): Promise<void> {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.edited) {
                this.statisticsData[index].data[0].data[0]++;
            } else if (this.statisticsData[index].data[0].data[0] > 0) {
                this.statisticsData[index].data[0].data[0]--;
            }
            this.statisticsData[index].data[1].data[0] = this.playersLeft - this.statisticsData[index].data[0].data[0];
        } else {
            const initialCount = stat.edited ? 1 : 0;
            this.statisticsData.push({
                questionID: stat.questionId,
                data: [
                    {
                        data: [initialCount],
                        label: 'Nombre de personnes ayant modifié leur réponse dans les 5 dernières secondes',
                        backgroundColor: '#4CAF50',
                    },
                    {
                        data: [this.playersLeft - initialCount],
                        label: "Nombre de personnes n'ayant pas modifié leur réponse dans les 5 dernières secondes",
                        backgroundColor: '#FFCE56',
                    },
                ],
            });
        }
        this.barChartData = this.statisticsData[this.questionIndex]?.data;
        this.appBarChart.datasets = this.barChartData;
        this.appBarChart.labels = this.currentQuestion.text;
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
        this.statisticsData[this.questionIndex].data[barIndex].data[0]++;
    }
    gradeAnswers(): void {
        this.disableControls = true;
        this.socketService.sendMessage(Events.SEND_QRL_ANSWER, Namespaces.GAME);
        this.timeService.stopTimer();
        setTimeout(() => {
            this.gradingAnswers = true;
            this.qRLAnswers.sort((a, b) => a.author.localeCompare(b.author));
            this.currentQRLAnswer = this.qRLAnswers[0];
        }, RECEIVE_ANSWERS_DELAY);
        this.statisticsData[this.questionIndex] = {
            questionID: this.currentQuestion.id,
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
            questionId: this.currentQuestion.id,
            author: this.currentQRLAnswer.author,
            grade: multiplier * this.currentQuestion.points,
            multiplier,
        };
        this.socketService.sendMessage(Events.QRL_GRADE, Namespaces.GAME, qrlGrade);
        this.qRLAnswers.shift();
        this.currentQRLAnswer = this.qRLAnswers[0];
        if (this.qRLAnswers.length === 0) {
            if (this.gameManagerService.onLastQuestion()) {
                this.notifyEndGame();
                return;
            }
            this.gradingAnswers = false;
            this.notifyNextQuestion();
        }
    }
    showResults(): void {
        this.socketService.sendMessage(Events.SHOW_RESULTS, Namespaces.GAME);
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
    }
    notifyNextQuestion() {
        if (!this.statisticsData[this.questionIndex]) {
            this.statisticsData[this.questionIndex] = {
                questionID: this.currentQuestion.id,
                data: [],
            };
        }
        this.disableControls = true;
        this.deactivatePanicMode();
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
        this.choseNextQuestion();
        this.questionLoaded = false;
    }

    onNextQuestionReceived(): void {
        this.questionIndex++;
        this.currentQuestion = this.gameManagerService.goNextQuestion();
        this.gradingAnswers = false;
        this.qRLAnswers = [];
        this.disableControls = false;
        this.nConfirmations = 0;
        this.disableNextQuestion = true;
        if (this.gameManagerService.onLastQuestion()) {
            this.onLastQuestion = true;
        }
        this.timer = this.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;
        this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.timer });
        if (this.currentQuestion.type === Type.QRL) {
            const qrlStat: QRLStats = {
                questionId: this.currentQuestion.id,
                edited: false,
            };
            for (let i = 1; i <= this.playersLeft; i++) {
                this.updateQRLBarChartData(qrlStat);
            }
        }
    }
    sendTimerControlMessage(): void {
        this.timerPaused = !this.timerPaused;
        this.socketService.sendMessage(Events.PAUSE_TIMER, Namespaces.GAME);
    }
    activatePanicMode(): void {
        this.inPanicMode = true;
        this.socketService.sendMessage(Events.PANIC_MODE, Namespaces.GAME, { type: this.currentQuestion.type });
    }
    deactivatePanicMode(): void {
        this.inPanicMode = false;
        this.socketService.sendMessage(Events.PANIC_MODE_OFF, Namespaces.GAME);
    }
    openCountDownModal(): void {
        this.showCountDown = true;
    }
    onCountDownModalClosed(): void {
        this.showCountDown = false;
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
        if (!this.questionLoaded) {
            this.questionLoaded = true;
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
            setTimeout(() => {
                this.onNextQuestionReceived();
            }, 2 * SHOW_FEEDBACK_DELAY);
        }
    }
    handleTimerEnd(): void {
        if (this.onLastQuestion) {
            this.timeService.stopTimer();
            this.notifyEndGame();
        } else if (this.currentQuestion.type === Type.QCM) {
            this.notifyNextQuestion();
        } else if (this.currentQuestion.type === Type.QRL) {
            this.gradeAnswers();
        }
    }
    onPlayerLeft(data: { user: string }): void {
        const username = (data as { user: string }).user;
        const player = this.playerService.playersInGame.find((p) => p.name === username);
        if (player) {
            player.leftGame = true;
        }
        this.playersLeft = this.playerService.nActivePlayers();
        if (this.playersLeft === 0) {
            this.snackBar.open('Tous les joueurs ont quitté la partie, la partie sera interrompue sous peu', 'Fermer', {
                verticalPosition: 'top',
                duration: 3000,
            });
            setTimeout(() => {
                this.socketService.endGame();
            }, SHOW_FEEDBACK_DELAY);
        }
        if (this.currentQuestion.type === Type.QRL) {
            const qrlStat: QRLStats = {
                questionId: this.currentQuestion.id,
                edited: false,
            };
            this.updateQRLBarChartData(qrlStat);
        }
    }
    ngOnDestroy() {
        this.timeService.stopTimer();
        this.timerPaused = false;
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
            this.qRLAnswers.push(answer as QRLAnswer);
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
            this.nConfirmations++;
            if (this.nConfirmations === this.playersLeft) {
                this.disableNextQuestion = false;
            }
        });
    }
}
