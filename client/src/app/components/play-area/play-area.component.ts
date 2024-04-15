import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { PlayAreaLogic } from '@app/components/play-area/play-area-logic';
import { GameManagerService } from '@app/services/game-manager.service';
import { GameSessionService } from '@app/services/game-session.service';
import { PlayerService } from '@app/services/player.service';
import { QRLStatService } from '@app/services/qrl-stats.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { RANDOM_INDICATOR, START_GAME_DELAY } from '@common/consts';
import { Type } from '@common/game';
import { QRLGrade } from '@common/game-stats';
import { ChatMessage, SystemMessages as sysMsg } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';
import { MAX_QRL_LENGTH, QRL_TIMER, SHOW_FEEDBACK_DELAY } from './const';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    logic: PlayAreaLogic = new PlayAreaLogic(this.snackBar, this.playerService);
    private timer: number;
    private points = 0;

    private nextQuestionSubscription: Subscription;
    private nextRandomQuestionSubscription: Subscription;
    private endGameSubscription: Subscription;
    private abortGameSubscription: Subscription;
    private bonusSubscription: Subscription;
    private bonusGivenSubscription: Subscription;
    private sendQRLAnswerSubscription: Subscription;
    private qrlGradeSubscription: Subscription;
    private timerEndedSubscription: Subscription;

    // La play area a besoin d'un accès à chaque paramètre du constructeur, les changer de fichier ne serait pas
    // vraiemnt bénéfique et en enlever bloquerait certaines fonctionnalités.
    // eslint-disable-next-line max-params
    constructor(
        readonly timeService: TimeService,
        readonly gameManager: GameManagerService,
        readonly socketService: SocketRoomService,
        readonly playerService: PlayerService,
        private qrlStatsService: QRLStatService,
        private changeDetector: ChangeDetectorRef,
        public abortDialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private gameSessionService: GameSessionService,
    ) {
        this.playerService.player.score = 0;
        this.logic.answer = [];
        this.timeService.pauseFlag = false;
        this.setInTestMode();
        this.setInRandomMode();
    }

    get time(): number {
        return this.timeService.time;
    }

    get point(): number {
        return this.points;
    }

    get playerScore(): number {
        return this.logic.score;
    }

    get charsLeft(): number {
        return MAX_QRL_LENGTH - this.logic.qrlAnswer.length;
    }

    @HostListener('keydown', ['$event'])
    detectButton(event: KeyboardEvent) {
        this.logic.buttonPressed = event.key;
        if (this.logic.buttonPressed === 'Enter' && this.logic.question.type === Type.QCM && !this.logic.choiceDisabled) {
            this.confirmAnswers(true);
        } else if (this.logic.isCorrectKeyBoardInput()) {
            const index = parseInt(this.logic.buttonPressed, 10);
            const choice = this.logic.question.choices?.[index - 1]?.text;
            if (choice) {
                this.handleQCMChoice(choice);
            }
        }
    }

    async ngOnInit() {
        const gameID = this.route.snapshot.paramMap.get('id');
        if (this.logic.inTestMode && gameID) {
            await this.gameManager.initialize(gameID);
        } else {
            await this.gameManager.initialize(this.socketService.room);
        }
        this.logic.question = this.gameManager.firstQuestion();
        if (this.logic.question.type === Type.QRL) {
            this.qrlStatsService.startTimer(this.logic.question.id);
        }
        this.logic.nbChoices = this.logic.question.choices?.length ?? 0;
        if (this.logic.inTestMode) {
            this.timer = this.logic.question.type === Type.QCM ? (this.gameManager.game.duration as number) : QRL_TIMER;
            this.timeService.startTimer(this.timer);
        }
        this.setSubscriptions();
        window.addEventListener('hashchange', this.onLocationChange);
        window.addEventListener('popstate', this.onLocationChange);
    }
    ngOnDestroy() {
        this.timeService.stopTimer();
        this.qrlStatsService.stopTimer();
        this.gameManager.reset();

        this.nextQuestionSubscription?.unsubscribe();
        this.nextRandomQuestionSubscription?.unsubscribe();
        this.endGameSubscription?.unsubscribe();
        this.bonusSubscription?.unsubscribe();
        this.bonusGivenSubscription?.unsubscribe();
        this.abortGameSubscription?.unsubscribe();
        this.qrlGradeSubscription?.unsubscribe();
        this.sendQRLAnswerSubscription?.unsubscribe();
        this.timerEndedSubscription?.unsubscribe();
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
    }

    shouldRender(text: string) {
        return text !== '';
    }
    goNextQuestion() {
        this.logic.prepNextQuestion();
        this.endGameTest();
        const newQuestion = this.gameManager.goNextQuestion();
        this.logic.question = newQuestion;
        if (newQuestion && newQuestion.type === Type.QCM) {
            this.logic.nbChoices = this.logic.question.choices?.length ?? 0;
        } else if (newQuestion && newQuestion.type === 'QRL') {
            this.qrlStatsService.startTimer(newQuestion.id);
        }
        this.changeDetector.detectChanges();
        if (this.logic.inTestMode || this.logic.inRandomMode) {
            this.timeService.stopTimer();
            this.timer = this.logic.question.type === Type.QCM ? (this.gameManager.game.duration as number) : QRL_TIMER;
            this.timeService.startTimer(this.timer);
        }
    }

    handleQCMChoice(answer: string) {
        this.logic.prepAnswerStat(answer, this.playerService.player);
        this.socketService.sendMessage(Events.QCM_STATS, nsp.GAME_STATS, this.logic.answerStat);
    }

    isChoice(choice: string): boolean {
        return this.logic.answer.includes(choice);
    }

    async confirmAnswers(fromUserInput: boolean) {
        if (!this.logic.inRandomMode) {
            this.timeService.stopTimer();
        }
        this.logic.choiceDisabled = true;
        if (fromUserInput) {
            this.socketService.confirmAnswer(this.playerService.player); // Sert à changer la couleur du texte affiché dans la vue de l'organisateur.
            if (this.logic.inRandomMode) {
                this.socketService.sendMessage(Events.CONFIRM_ANSWER_R, nsp.GAME);
            }
        } else {
            this.socketService.sendMessage(Events.RESET_NUMBER_ANSWERS, nsp.GAME);
        }

        if (this.logic.inTestMode || (this.logic.inRandomMode && !this.time)) {
            if (this.logic.question.type === Type.QCM) {
                this.logic.feedback = await this.gameManager.getFeedBack(this.logic.question.id, this.logic.answer);
            }
            this.countPointsAndNextQuestion();
            return;
        }
    }

    sendQRLAnswer() {
        this.timeService.stopTimer();
        this.qrlStatsService.stopTimer();
        this.socketService.sendMessage(Events.QRL_ANSWER, nsp.GAME, this.logic.prepQRLAnswer());
    }
    async countPointsAndNextQuestion() {
        this.logic.movingToNextQuestion = true;
        if (this.logic.question.type === Type.QCM || this.logic.inTestMode) {
            await this.updateScore();
        }
        setTimeout(
            () => {
                this.logic.choiceDisabled = false;
                this.goNextQuestion();
            },
            this.logic.inTestMode ? SHOW_FEEDBACK_DELAY : SHOW_FEEDBACK_DELAY * 2,
        );
        if (!this.logic.inTestMode) {
            setTimeout(() => {
                this.openCountDownModal();
            }, SHOW_FEEDBACK_DELAY);
        }
    }

    onQRLAnswerChange() {
        this.qrlStatsService.notifyEdit();
        this.socketService.sendMessage(Events.NOTIFY_QRL_INPUT, nsp.GAME_STATS, this.playerService.player);
    }
    onFinalAnswer() {
        if (!this.logic.bonusGiven) {
            this.socketService.sendMessage(Events.FINAL_ANSWER, nsp.GAME);
        }
    }
    async updateScore() {
        if (this.logic.question.type === Type.QRL && this.logic.inTestMode) {
            this.logic.score += this.logic.question.points;
            return;
        }
        const isCorrectAnswer = await this.gameManager.isCorrectAnswer(this.logic.answer, this.logic.question.id);
        this.logic.calculateScore(isCorrectAnswer);
        this.socketService.sendMessage(Events.UPDATE_PLAYER, nsp.GAME_STATS, { ...this.playerService.player });
    }
    handleAbortGame(): void {
        const message = 'Êtes-vous sûr de vouloir abandonner la partie?';
        const dialogData = new ConfirmDialogModel('Abandon', message);
        const dialogRef = this.abortDialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: dialogData,
        });

        dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
                this.timeService.stopTimer();
                this.logic.score = 0;
                this.logic.answer = [];
                const chatMessage: ChatMessage = {
                    author: sysMsg.AUTHOR,
                    message: this.playerService.player.name + ' ' + sysMsg.PLAYER_LEFT,
                    timeStamp: new Date().toLocaleTimeString(),
                };
                this.socketService.sendChatMessage(chatMessage);
                this.socketService.abandonGame();
                this.router.navigate(['/']);
                this.onLocationChange();
            }
        });
    }
    async endGame() {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);
        this.router.navigate(['results'], { relativeTo: this.route });
        await this.gameSessionService.completeSession(this.gameManager.gamePin, this.playerService.findBestScore());
    }

    onLocationChange = () => {
        this.socketService.endGame();
    };
    async endGameTest() {
        if (this.gameManager.onLastQuestion() && this.logic.inTestMode) {
            this.router.navigate(['/createGame']);
        } else if (this.gameManager.onLastQuestion() && this.logic.inRandomMode) {
            await this.confirmAnswers(false);
            if (this.logic.question.type === Type.QCM) {
                this.logic.feedback = await this.gameManager.getFeedBack(this.logic.question.id, this.logic.answer);
            }
            await this.countPointsAndNextQuestion();
            this.socketService.sendMessage(Events.STORE_PLAYER, nsp.GAME_STATS, this.playerService.player);
            setTimeout(() => {
                this.endGame();
            }, SHOW_FEEDBACK_DELAY);
        }
    }
    openCountDownModal(): void {
        this.logic.showCountDown = true;
        this.logic.countDownKey = Date.now();
    }
    onCountDownModalClosed(): void {
        this.logic.showCountDown = false;
    }
    // Le any vient d'un appel à une fonction de Angular. Ce qui est hors de notre contrôle.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-undef
    trackByFunction(item: any) {
        return item.id;
    }
    private setInRandomMode(): void {
        this.logic.inRandomMode = this.router.url.slice(RANDOM_INDICATOR) === 'aleatoire';
    }
    private setInTestMode(): void {
        this.logic.inTestMode = this.route.snapshot.queryParams.testMode === 'true';
    }

    private setSubscriptions(): void {
        this.timerEndedSubscription = this.timeService.timerEnded.subscribe(async () => {
            if (this.logic.movingToNextQuestion) {
                this.timeService.stopTimer();
                return;
            }
            await this.confirmAnswers(false);
        });

        this.nextQuestionSubscription = this.socketService.listenForMessages(nsp.GAME, Events.NEXT_QUESTION).subscribe(async () => {
            await this.confirmAnswers(false);
            if (this.logic.question.type === Type.QCM) {
                this.logic.feedback = await this.gameManager.getFeedBack(this.logic.question.id, this.logic.answer);
            }
            await this.countPointsAndNextQuestion();
        });

        this.endGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.END_GAME).subscribe(async () => {
            await this.confirmAnswers(false);
            if (this.logic.question.type === Type.QCM) {
                this.logic.feedback = await this.gameManager.getFeedBack(this.logic.question.id, this.logic.answer);
            }
            await this.countPointsAndNextQuestion();
            this.socketService.sendMessage(Events.STORE_PLAYER, nsp.GAME_STATS, this.playerService.player);
            setTimeout(() => {
                this.endGame();
            }, SHOW_FEEDBACK_DELAY);
        });

        this.sendQRLAnswerSubscription = this.socketService.listenForMessages(nsp.GAME, Events.SEND_QRL_ANSWER).subscribe(() => {
            this.sendQRLAnswer();
        });
        this.qrlGradeSubscription = this.socketService.listenForMessages(nsp.GAME, Events.QRL_GRADE).subscribe((grade: unknown) => {
            const qrlGrade = grade as QRLGrade;
            if (qrlGrade.author === this.playerService.player.name) {
                this.logic.score += qrlGrade.grade;
                this.playerService.player.score = this.logic.score;
                this.logic.bonusGiven = false;
                this.logic.gotBonus = false;
            }
            this.socketService.sendMessage(Events.UPDATE_PLAYER, nsp.GAME_STATS, this.playerService.player);
        });
        this.bonusSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS).subscribe(() => {
            this.logic.gotBonus = true;
        });
        this.bonusGivenSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS_GIVEN).subscribe(() => {
            this.logic.bonusGiven = true;
        });

        this.abortGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.ABORT_GAME).subscribe(() => {
            this.snackBar.open("L'organisateur a mis fin à la partie", 'Fermer', {
                duration: START_GAME_DELAY,
                verticalPosition: 'top',
            });
            this.router.navigate(['/']);
            this.socketService.endGame();
        });
    }
}
