/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-lines */
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { MouseButton } from '@app/interfaces/game-elements';
import { PlayAreaLogic } from '@app/interfaces/play-area-logic';
import { GameManagerService } from '@app/services/game-manager.service';
import { GameSessionService } from '@app/services/game-session.service';
import { PlayerService } from '@app/services/player.service';
import { QRLStatService } from '@app/services/qrl-stats.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { RANDOM_INDICATOR, START_GAME_DELAY } from '@common/consts';
import { Type } from '@common/game';
import { QRLAnswer, QRLGrade } from '@common/game-stats';
import { ChatMessage, SystemMessages as sysMsg } from '@common/message';
import { Events, Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';
import { BONUS_MULTIPLIER, ERROR_INDEX, MAX_QRL_LENGTH, QRL_TIMER, SHOW_FEEDBACK_DELAY } from './const';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    attributes: PlayAreaLogic = new PlayAreaLogic();
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
        this.attributes.answer = [];
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
        return this.attributes.score;
    }

    get charsLeft(): number {
        return MAX_QRL_LENGTH - this.attributes.qrlAnswer.length;
    }

    @HostListener('keydown', ['$event'])
    detectButton(event: KeyboardEvent) {
        this.attributes.buttonPressed = event.key;
        if (this.attributes.buttonPressed === 'Enter' && this.attributes.question.type === Type.QCM && !this.attributes.choiceDisabled) {
            this.confirmAnswers(true);
        } else if (
            this.attributes.buttonPressed >= '1' &&
            this.attributes.buttonPressed <= '4' &&
            this.attributes.question.type === Type.QCM &&
            this.attributes.buttonPressed <= this.attributes.nbChoices.toString()
        ) {
            const index = parseInt(this.attributes.buttonPressed, 10);
            this.handleQCMChoice(this.attributes.question.choices![index - 1].text);
        }
    }

    async ngOnInit() {
        this.timerEndedSubscription = this.timeService.timerEnded.subscribe(async () => {
            if (this.attributes.movingToNextQuestion) {
                this.timeService.stopTimer();
                return;
            }
            await this.confirmAnswers(false);
        });
        const gameID = this.route.snapshot.paramMap.get('id');
        if (this.attributes.inTestMode && gameID) {
            await this.gameManager.initialize(gameID);
        } else {
            await this.gameManager.initialize(this.socketService.room);
        }
        this.attributes.question = this.gameManager.firstQuestion();
        if (this.attributes.question.type === Type.QRL) {
            this.qrlStatsService.startTimer(this.attributes.question.id);
        }
        this.attributes.nbChoices = this.attributes.question.choices?.length ?? 0;
        if (this.attributes.inTestMode) {
            this.timer = this.attributes.question.type === Type.QCM ? (this.gameManager.game.duration as number) : QRL_TIMER;
            this.timeService.startTimer(this.timer);
        }

        this.nextQuestionSubscription = this.socketService.listenForMessages(nsp.GAME, Events.NEXT_QUESTION).subscribe(async () => {
            await this.confirmAnswers(false);
            if (this.attributes.question.type === Type.QCM) {
                this.attributes.feedback = await this.gameManager.getFeedBack(this.attributes.question.id, this.attributes.answer);
            }
            await this.countPointsAndNextQuestion();
        });

        this.endGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.END_GAME).subscribe(async () => {
            await this.confirmAnswers(false);
            if (this.attributes.question.type === Type.QCM) {
                this.attributes.feedback = await this.gameManager.getFeedBack(this.attributes.question.id, this.attributes.answer);
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
                this.attributes.score += qrlGrade.grade;
                this.playerService.player.score = this.attributes.score;
                this.attributes.bonusGiven = false;
                this.attributes.gotBonus = false;
            }
            this.socketService.sendMessage(Events.UPDATE_PLAYER, nsp.GAME_STATS, this.playerService.player);
        });

        this.bonusSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS).subscribe(() => {
            this.attributes.gotBonus = true;
        });

        this.bonusGivenSubscription = this.socketService.listenForMessages(nsp.GAME, Events.BONUS_GIVEN).subscribe(() => {
            this.attributes.bonusGiven = true;
        });

        this.abortGameSubscription = this.socketService.listenForMessages(nsp.GAME, Events.ABORT_GAME).subscribe(() => {
            this.snackBar.open("L'organisateur a mis fin à la partie", 'Fermer', {
                duration: START_GAME_DELAY,
                verticalPosition: 'top',
            });
            this.router.navigate(['/']);
            this.socketService.endGame();
        });

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
        this.attributes.answer = [];
        this.attributes.feedback = [];
        this.attributes.qrlAnswer = '';
        this.attributes.movingToNextQuestion = false;
        this.endGameTest();
        const newQuestion = this.gameManager.goNextQuestion();
        this.attributes.question = newQuestion;
        if (newQuestion && newQuestion.type === Type.QCM) {
            this.attributes.nbChoices = this.attributes.question.choices?.length ?? 0;
        } else if (newQuestion && newQuestion.type === 'QRL') {
            this.qrlStatsService.startTimer(newQuestion.id);
        }
        this.changeDetector.detectChanges();
        if (this.attributes.inTestMode || this.attributes.inRandomMode) {
            this.timeService.stopTimer();
            this.timer = this.attributes.question.type === Type.QCM ? (this.gameManager.game.duration as number) : QRL_TIMER;
            this.timeService.startTimer(this.timer);
        }
    }

    handleQCMChoice(answer: string) {
        let choiceInList = false;
        for (let i = 0; i < this.attributes.answer.length; i++) {
            if (answer === this.attributes.answer[i]) {
                this.attributes.answer.splice(i, 1);
                choiceInList = true;
                i--;
                break;
            }
        }
        if (!choiceInList) {
            this.attributes.answer.push(answer);
        }

        this.attributes.answerStat = {
            questionId: this.attributes.question.id,
            choiceIndex: this.attributes.question.choices!.findIndex((c) => c.text === answer),
            correctIndex: this.attributes.question.choices!.find((choice) => choice.isCorrect)?.index ?? ERROR_INDEX,
            choiceAmount: this.attributes.nbChoices,
            selected: !choiceInList,
            player: this.playerService.player,
        };
        this.socketService.sendMessage(Events.QCM_STATS, nsp.GAME_STATS, this.attributes.answerStat);
    }

    isChoice(choice: string): boolean {
        return this.attributes.answer.includes(choice);
    }

    async confirmAnswers(fromUserInput: boolean) {
        // true : appelé par input utilisateur, false : appelé par serveur,
        if (!this.attributes.inRandomMode) {
            this.timeService.stopTimer();
        }
        this.attributes.choiceDisabled = true;
        if (fromUserInput) {
            this.socketService.confirmAnswer(this.playerService.player); // Sert à changer la couleur du texte affiché dans la vue de l'organisateur.
            if (this.attributes.inRandomMode) {
                this.socketService.sendMessage(Events.CONFIRM_ANSWER_R, nsp.GAME);
            }
        } else {
            this.socketService.sendMessage(Events.RESET_NUMBER_ANSWERS, nsp.GAME);
        }

        if (this.attributes.inTestMode || (this.attributes.inRandomMode && !this.time)) {
            if (this.attributes.question.type === Type.QCM) {
                this.attributes.feedback = await this.gameManager.getFeedBack(this.attributes.question.id, this.attributes.answer);
            }
            this.countPointsAndNextQuestion();
            return;
        }
    }

    sendQRLAnswer() {
        this.timeService.stopTimer();
        this.qrlStatsService.stopTimer();
        this.attributes.choiceDisabled = true;

        const qrlAnswer: QRLAnswer = {
            questionId: this.attributes.question.id,
            author: this.playerService.player.name,
            answer: this.attributes.qrlAnswer,
        };
        this.socketService.sendMessage(Events.QRL_ANSWER, nsp.GAME, qrlAnswer);
        this.snackBar.open('Votre réponse a été envoyée pour correction, veuillez patienter', 'Fermer', {
            duration: START_GAME_DELAY,
            verticalPosition: 'top',
        });
    }

    async countPointsAndNextQuestion() {
        this.attributes.movingToNextQuestion = true;
        if (this.attributes.question.type === Type.QCM || this.attributes.inTestMode) {
            await this.updateScore();
        }
        setTimeout(
            () => {
                this.attributes.choiceDisabled = false;
                this.goNextQuestion();
            },
            this.attributes.inTestMode ? SHOW_FEEDBACK_DELAY : SHOW_FEEDBACK_DELAY * 2,
        );
        if (!this.attributes.inTestMode) {
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
        if (!this.attributes.bonusGiven) {
            this.socketService.sendMessage(Events.FINAL_ANSWER, nsp.GAME);
        }
    }
    async updateScore() {
        if (this.attributes.question.type === Type.QRL && this.attributes.inTestMode) {
            this.attributes.score += this.attributes.question.points;
            return;
        }
        const isCorrectAnswer = await this.gameManager.isCorrectAnswer(this.attributes.answer, this.attributes.question.id);
        if (isCorrectAnswer && this.attributes.question.points) {
            if (this.attributes.inTestMode || this.attributes.gotBonus) {
                const pointsWithBonus = this.attributes.question.points * (1 + BONUS_MULTIPLIER);
                this.attributes.score += pointsWithBonus;
                this.attributes.pointsGained = pointsWithBonus;
                this.playerService.player.bonusCount++;
                this.snackBar.open('Bravo! Vous avez obtenu le point bonus!', 'Fermer', {
                    duration: 3000,
                });
            } else {
                this.attributes.score += this.attributes.question.points;
                this.attributes.pointsGained = this.attributes.question.points;
            }

            this.attributes.showPoints = true;
            setTimeout(() => {
                this.attributes.showPoints = false;
            }, SHOW_FEEDBACK_DELAY);

            this.playerService.player.score = this.attributes.score;
            this.attributes.bonusGiven = false;
            this.attributes.gotBonus = false;
        }
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
                this.attributes.score = 0;
                this.attributes.answer = [];
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
        if (this.gameManager.onLastQuestion() && this.attributes.inTestMode) {
            this.router.navigate(['/createGame']);
        } else if (this.gameManager.onLastQuestion() && this.attributes.inRandomMode) {
            await this.confirmAnswers(false);
            if (this.attributes.question.type === Type.QCM) {
                this.attributes.feedback = await this.gameManager.getFeedBack(this.attributes.question.id, this.attributes.answer);
            }
            await this.countPointsAndNextQuestion();
            this.socketService.sendMessage(Events.STORE_PLAYER, nsp.GAME_STATS, this.playerService.player);
            setTimeout(() => {
                this.endGame();
            }, SHOW_FEEDBACK_DELAY);
        }
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choiceText: string): string {
        if (!this.attributes.feedback) return '';
        const feedbackItem = this.attributes.feedback?.find((f) => f.choice === choiceText);
        if (!feedbackItem) return '';

        return feedbackItem.status;
    }

    openCountDownModal(): void {
        this.attributes.showCountDown = true;
        this.attributes.countDownKey = Date.now();
    }

    onCountDownModalClosed(): void {
        this.attributes.showCountDown = false;
    }
    // Le any vient d'un appel à une fonction de Angular.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-undef
    trackByFunction(item: any) {
        return item.id;
    }

    private setInRandomMode(): void {
        this.attributes.inRandomMode = this.router.url.slice(RANDOM_INDICATOR) === 'aleatoire';
    }

    private setInTestMode(): void {
        this.attributes.inTestMode = this.route.snapshot.queryParams.testMode === 'true';
    }
}
