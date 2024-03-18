import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { MouseButton } from '@app/interfaces/game-elements';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Player, Question, Type } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { ChatMessage, SystemMessages as sysmsg } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';
import { PlayerService } from './../../services/player.service';

export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export const SHOW_FEEDBACK_DELAY = 3000;
export const DEFAULT_TIMER = 25;
export const BONUS_MULTIPLIER = 1.2;
const ERROR_INDEX = -1;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    player: Player;
    inTestMode: boolean = false;
    buttonPressed = '';
    question: Question = {} as Question;

    answer: string[] = [];
    nbChoices: number;
    score = 0;

    showPoints: boolean = false;
    showCountDown: boolean = false;
    countDownKey: number = Date.now(); // to force change dete/ctiosn
    disableChoices = false;
    feedback: Feedback[];
    qcmstat: QCMStats;
    bonusGiven = false;
    gotBonus = false;

    private timer: number;
    private points = 0;

    private nextQuestionSubscription: Subscription;
    private endGameSubscription: Subscription;
    private abortGameSubscription: Subscription;
    private bonusSubscription: Subscription;
    private bonusGivenSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        readonly timeService: TimeService,
        public gameManager: GameManagerService,
        public socketService: SocketRoomService,
        private playerService: PlayerService,
        private cdr: ChangeDetectorRef,
        public abortDialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
    ) {
        this.player = this.playerService.player;
        this.answer = [];
        if (this.route.snapshot.queryParams.testMode === 'true') {
            this.inTestMode = true;
        }

        this.nextQuestionSubscription = this.socketService.listenForMessages(nsp.GAME, Events.NEXT_QUESTION).subscribe(async () => {
            await this.confirmAnswers();
            this.countPointsAndNextQuestion();
            this.feedback = await this.gameManager.getFeedBack(this.question.id, this.answer);
        });

        this.socketService.listenForMessages(nsp.GAME, Events.START_TIMER).subscribe(() => {
            this.timer = this.gameManager.game.duration as number;
            this.timeService.startTimer(this.timer);
        });

        this.endGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.END_GAME).subscribe(() => {
            this.endGame();
        });

        this.bonusSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS).subscribe(() => {
            this.gotBonus = true;
        });

        this.bonusGivenSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS_GIVEN).subscribe(() => {
            this.bonusGiven = true;
        });

        this.abortGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.ABORT_GAME).subscribe(() => {
            this.snackBar.open("L'organisateur a mis fin à la partie ", 'Fermer');
            this.router.navigate(['/']);
        });
    }

    // Devra être changé plus tard.
    get time(): number {
        if (this.timeService.time === 0) this.confirmAnswers();
        return this.timeService.time;
    }

    get point(): number {
        return this.points;
    }

    get playerScore(): number {
        return this.score;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
            this.confirmAnswers();
        } else if (
            this.buttonPressed >= '1' &&
            this.buttonPressed <= '4' &&
            this.question.type === Type.QCM &&
            this.buttonPressed <= this.nbChoices.toString()
        ) {
            const index = parseInt(this.buttonPressed, 10);
            this.handleQCMChoice(this.question.choices[index - 1].text);
        }
    }

    async ngOnInit() {
        const gameID = this.route.snapshot.paramMap.get('id');
        if (this.inTestMode && gameID) {
            await this.gameManager.initialize(gameID);
        } else {
            await this.gameManager.initialize(this.socketService.room);
        }
        this.question = this.gameManager.firstQuestion();
        this.nbChoices = this.question.choices?.length ?? 0;
    }
    ngOnDestroy() {
        this.timeService.stopTimer();
        this.gameManager.reset();

        this.nextQuestionSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
        this.bonusSubscription.unsubscribe();
        this.bonusGivenSubscription.unsubscribe();
        this.abortGameSubscription.unsubscribe();
    }

    shouldRender(text: string) {
        return text !== '';
    }

    nextQuestion() {
        this.answer = [];
        this.endGameTest();
        const newQuestion = this.gameManager.nextQuestion();
        if (this.question !== newQuestion) {
            this.question = newQuestion;
            if (newQuestion && newQuestion.type === 'QCM') {
                this.nbChoices = this.question.choices.length;
            }
            this.socketService.sendMessage(Events.START_TIMER, nsp.GAME);
        } else {
            this.notifyEndGame();
        }
        this.cdr.detectChanges();
    }

    handleQCMChoice(answer: string) {
        let choiceInList = false;
        for (let i = 0; i < this.answer.length; i++) {
            if (answer === this.answer[i]) {
                this.answer.splice(i, 1);
                choiceInList = true;
                i--;
                break;
            }
        }
        if (!choiceInList) {
            this.answer.push(answer);
        }

        this.qcmstat = {
            questionId: this.question.id,
            choiceIndex: this.question.choices.findIndex((c) => c.text === answer),
            correctIndex: this.question.choices.find((choice) => choice.isCorrect)?.index ?? ERROR_INDEX,
            choiceAmount: this.nbChoices,
            selected: !choiceInList,
        };
        this.socketService.sendMessage(Events.QCM_STATS, nsp.GAME_STATS, this.qcmstat);
    }

    isChoice(choice: string): boolean {
        return this.answer.includes(choice);
    }

    async confirmAnswers() {
        this.disableChoices = true;
        this.timeService.stopTimer();

        if (this.inTestMode) {
            this.feedback = await this.gameManager.getFeedBack(this.question.id, this.answer);
            this.countPointsAndNextQuestion();
        }
    }

    countPointsAndNextQuestion() {
        this.updateScore();
        setTimeout(
            () => {
                this.disableChoices = false;
                this.nextQuestion();
            },
            this.inTestMode ? SHOW_FEEDBACK_DELAY : SHOW_FEEDBACK_DELAY * 2,
        );
        if (!this.inTestMode) {
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
        }
    }

    notifyNextQuestion() {
        this.socketService.sendMessage(Events.NEXT_QUESTION, nsp.GAME);
    }

    notifyEndGame() {
        this.socketService.sendMessage(Events.END_GAME, nsp.GAME);
    }

    onFinalAnswer() {
        if (!this.bonusGiven) {
            this.socketService.sendMessage(Events.FINAL_ANSWER, nsp.GAME);
        }
    }
    async updateScore() {
        if (this.question.type === Type.QRL) {
            this.score += this.question.points;
            return;
        }
        const isCorrectAnswer = await this.gameManager.isCorrectAnswer(this.answer, this.question.id);
        if (isCorrectAnswer && this.question.points) {
            this.showPoints = true;
            setTimeout(() => {
                this.showPoints = false;
            }, SHOW_FEEDBACK_DELAY);

            this.score += this.question.points;
            if (this.inTestMode || this.gotBonus) {
                this.score *= BONUS_MULTIPLIER;
                this.player.bonusCount++;
            }

            this.player.score = this.score;
            this.bonusGiven = false;
            this.gotBonus = false;
        }
        this.socketService.sendMessage(Events.UPDATE_PLAYER, nsp.GAME_STATS, this.player);
        console.log(1);
    }

    handleAbort(): void {
        const message = 'Êtes-vous sûr de vouloir abandonner la partie?';

        const dialogData = new ConfirmDialogModel('Abandon', message);

        const dialogRef = this.abortDialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: dialogData,
        });

        dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
                this.timeService.stopTimer();
                this.score = 0;
                this.answer = [];
                const chatMessage: ChatMessage = {
                    author: sysmsg.AUTHOR,
                    message: this.player.name + ' ' + sysmsg.PLAYER_LEFT,
                    timeStamp: new Date().toLocaleTimeString(),
                };
                this.socketService.sendChatMessage(chatMessage);
                this.router.navigate(['/']);
            }
        });
    }

    endGame() {
        this.router.navigate(['results'], { relativeTo: this.route });
    }

    endGameTest() {
        if (this.gameManager.endGame && this.inTestMode) {
            this.router.navigate(['/createGame']);
        }
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choiceText: string): string {
        if (!this.feedback) return '';
        const feedbackItem = this.feedback?.find((f) => f.choice === choiceText);
        if (!feedbackItem) return '';

        return feedbackItem.status;
    }

    openCountDownModal(): void {
        this.showCountDown = true;
        this.countDownKey = Date.now();
    }

    onCountDownModalClosed(): void {
        this.showCountDown = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackByFn(item: any) {
        return item.id;
    }
}
