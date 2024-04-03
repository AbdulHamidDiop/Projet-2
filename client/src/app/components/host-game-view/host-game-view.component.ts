import { Game, Player, Question, Type } from './../../../../../common/game';
/* eslint-disable max-lines */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QRL_TIMER } from '@app/components/play-area/const';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats, QRLAnswer, QRLGrade, QRLStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';

const SHOW_FEEDBACK_DELAY = 3000;
const RECEIVE_ANSWERS_DELAY = 2000;
const ZERO_GRADE_MULTIPLER = 0;
const HALF_GRADE_MULTIPLER = 0.5;
const FULL_GRADE_MULTIPLER = 1;

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
    gradingAnswers: boolean = false;
    currentQRLAnswer: QRLAnswer;
    qRLAnswers: QRLAnswer[] = [];
    questionIndex: number = 0;
    showCountDown: boolean = false;
    onLastQuestion: boolean = false;
    players: Player[] = [];
    playersLeft: number;
    displayPlayerList = true;
    unitTesting: boolean = false;
    disableControls: boolean = false;
    questionLoaded: boolean = false;
    inPanicMode: boolean = false;

    playerLeftSubscription: Subscription;
    getPlayersSubscription: Subscription;
    nextQuestionSubscription: Subscription;
    qcmStatsSubscription: Subscription;
    qrlStatsSubscription: Subscription;
    qrlAnswersSubscription: Subscription;
    timerEndedSubscription: Subscription;
    endGameSubscription: Subscription;
    updatePlayerSubscription: Subscription;

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
        this.players = this.playerService.playersInGame;
        this.playersLeft = this.players.length;

        this.getPlayersSubscription = this.socketService.getPlayers().subscribe((players: Player[]) => {
            this.playerService.setGamePlayers(players);
            this.players = players;
        });

        this.nextQuestionSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.NEXT_QUESTION).subscribe(() => {
            if (!this.questionLoaded) {
                setTimeout(() => {
                    this.openCountDownModal();
                }, SHOW_FEEDBACK_DELAY);
                setTimeout(() => {
                    this.questionIndex++;
                    this.currentQuestion = this.gameManagerService.goNextQuestion();
                    this.gradingAnswers = false;
                    this.qRLAnswers = [];
                    this.disableControls = false;

                    if (this.gameManagerService.onLastQuestion()) {
                        this.onLastQuestion = true;
                    }
                    this.timer = this.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;
                    this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.timer });
                }, 2 * SHOW_FEEDBACK_DELAY);
                this.questionLoaded = true;
            }
        });
    }

    get time(): number {
        return this.timeService.time;
    }

    async ngOnInit(): Promise<void> {
        await this.gameManagerService.initialize(this.socketService.room);
        this.currentQuestion = this.gameManagerService.firstQuestion();
        this.timer = this.currentQuestion.type === Type.QCM ? (this.gameManagerService.game.duration as number) : QRL_TIMER;

        this.socketService.sendMessage(Events.START_TIMER, Namespaces.GAME, { time: this.timer });

        this.qcmStatsSubscription = this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe((stat: unknown) => {
            this.updateBarChartData(stat as QCMStats);
            this.updatePlayerFromServer(stat as QCMStats);
        });

        this.qrlStatsSubscription = this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QRL_STATS).subscribe((stat: unknown) => {
            this.updateQRLBarChartData(stat as QRLStats);
        });

        this.qrlAnswersSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.QRL_ANSWER).subscribe((answer: unknown) => {
            this.qRLAnswers.push(answer as QRLAnswer);
        });

        this.timerEndedSubscription = this.timeService.timerEnded.subscribe(() => {
            if (this.currentQuestion.type === Type.QCM) {
                this.notifyNextQuestion();
            } else {
                this.gradeAnswers();
            }
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
            const playersCopy = this.players.filter((p) => p.name !== username);
            if (playersCopy.length < this.players.length) {
                this.playersLeft--;
            }
            // this.players = this.players.filter((p) => p.name !== username);
            // Quand le joueur abandonne la partie son nom est supposé être raturé mais toujours affiché.

            const player = this.playerService.playersInGame.find((p) => p.name === username);
            if (player) {
                player.leftGame = true;
            }

            if (this.playersLeft === 0) {
                this.snackBar.open('Tous les joueurs ont quitté la partie, la partie sera interrompue sous peu', 'Fermer', {
                    verticalPosition: 'top',
                    duration: 3000,
                });
                setTimeout(() => {
                    this.socketService.endGame();
                }, SHOW_FEEDBACK_DELAY);
            }
        });
        this.timeService.deactivatePanicMode();
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

        this.barChartData = this.statisticsData[this.questionIndex]?.data;
    }

    async updateQRLBarChartData(stat: QRLStats): Promise<void> {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.edited) {
                this.statisticsData[index].data[0].data[0]++;
            } else if (this.statisticsData[index].data[0].data[0] > 0) {
                this.statisticsData[index].data[0].data[0]--;
            }
            this.statisticsData[index].data[1].data[0] = this.players.length - this.statisticsData[index].data[0].data[0];
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
                        data: [this.players.length - initialCount],
                        label: "Nombre de personnes n'ayant pas modifié leur réponse dans les 5 dernières secondes",
                        backgroundColor: '#FFCE56',
                    },
                ],
            });
        }

        this.barChartData = this.statisticsData[this.questionIndex]?.data;
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
            author: this.currentQRLAnswer.author,
            grade: multiplier * this.currentQuestion.points,
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
        this.questionLoaded = false;
        this.deactivatePanicMode();
        this.socketService.sendMessage(Events.STOP_TIMER, Namespaces.GAME);
        this.choseNextQuestion();
    }

    sendTimerControlMessage(): void {
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
        for (const player of this.players) {
            if (stats.player && player.name === stats.player.name) {
                player.score = stats.player.score;
            }
        }
    }

    openResultsPage(): void {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);

        const gameId = this.route.snapshot.paramMap.get('id');
        if (gameId) {
            const RESPONSE_FROM_SERVER_DELAY = 500;
            // Le score n'est pas mis à jour dans la vue des résultats parceque la réponse du serveur se fait avant que le score soit mis à jour.
            // C'est peut-etre possible de regler ça en mettant les appels socket dans playerservice.
            setTimeout(() => {
                this.router.navigate(['/game', gameId, 'results']);
            }, RESPONSE_FROM_SERVER_DELAY);
        }
        this.socketService.sendMessage(Events.GAME_RESULTS, Namespaces.GAME_STATS, this.statisticsData);
        this.socketService.sendMessage(Events.GET_PLAYERS, Namespaces.GAME_STATS, this.playerService.playersInGame);
    }

    onLocationChange = () => {
        this.socketService.endGame();
    };

    choseNextQuestion(): void {
        this.socketService.sendMessage(Events.NEXT_QUESTION, Namespaces.GAME);
    }

    ngOnDestroy() {
        this.timeService.stopTimer();
        this.deactivatePanicMode();
        this.timeService.deactivatePanicMode();
        this.gameManagerService.reset();

        this.playerLeftSubscription?.unsubscribe();
        this.getPlayersSubscription?.unsubscribe();
        this.nextQuestionSubscription?.unsubscribe();
        this.qcmStatsSubscription?.unsubscribe();
        this.qrlStatsSubscription?.unsubscribe();
        this.qrlAnswersSubscription?.unsubscribe();
        this.timerEndedSubscription?.unsubscribe();
        this.endGameSubscription?.unsubscribe();
        this.updatePlayerSubscription?.unsubscribe();

        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
    }
}
