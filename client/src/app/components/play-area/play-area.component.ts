import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { GameManagerService } from '@app/services/game-manager.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Question, Type } from '@common/game';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export const SHOW_FEEDBACK_DELAY = 3000;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    inTestMode: boolean = false;
    buttonPressed = '';
    question: Question = {} as Question;

    answer: string[] = [];
    nbChoices: number;
    score = 0;

    disableChoices = false;
    showFeedback = false;
    feedback: Feedback[];
    private readonly timer = 25;
    private points = 0;
    // eslint-disable-next-line max-params
    constructor(
        readonly timeService: TimeService,
        private readonly gameManager: GameManagerService,
        private cdr: ChangeDetectorRef,
        public abortDialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
    ) {
        this.timeService.startTimer(this.timer);
        this.answer = [];
        if (window.location.href.includes('test')) {
            this.inTestMode = true;
        }
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
            const index = parseInt(this.buttonPressed, 4);
            this.handleQCMChoice(this.question.choices[index - 1].text);
        }
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    async ngOnInit() {
        const gameID = this.route.snapshot.paramMap.get('id');
        if (gameID) {
            await this.gameManager.initialize(gameID);
        }
        this.question = this.gameManager.nextQuestion();
        if (this.question.type === Type.QCM) {
            this.nbChoices = this.question.choices.length;
        }
    }
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.timeService.stopTimer();
        this.gameManager.reset();
    }

    shouldRender(text: string) {
        return text !== '';
    }

    nextQuestion() {
        this.endGameTest();
        const newQuestion = this.gameManager.nextQuestion();
        this.question = newQuestion;
        if (newQuestion && newQuestion.type === 'QCM') {
            this.nbChoices = this.question.choices.length;
        }
        this.timeService.stopTimer();
        this.timeService.startTimer(this.timer);
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
    }

    isChoice(choice: string): boolean {
        if (this.answer.includes(choice)) {
            return true;
        }
        return false;
    }

    // handleQRLAnswer(answer: string) { // sprint 2
    //     if (answer === 'B') {
    //         alert('La réponse correcte a été choisie');
    //     }
    // }

    async confirmAnswers() {
        this.disableChoices = true;

        this.showFeedback = true;
        this.feedback = await this.gameManager.getFeedBack(this.question.id, this.answer);

        setTimeout(() => {
            this.updateScore();
            this.showFeedback = false;
            this.disableChoices = false;
            this.answer = [];
            this.nextQuestion();
        }, SHOW_FEEDBACK_DELAY);
    }

    async updateScore() {
        const isCorrectAnswer = await this.gameManager.isCorrectAnswer(this.answer, this.question.id);
        if (isCorrectAnswer && this.question.points) {
            this.score += this.question.points;
        }
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
                this.router.navigate(['/createGame']);
            }
        });
    }

    endGameTest() {
        if (this.gameManager.endGame) {
            this.router.navigate(['/createGame']);
        }
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choiceText: string): string {
        if (!this.feedback) return '';
        const feedbackItem = this.feedback.find((f) => f.choice === choiceText);
        if (!feedbackItem) return '';

        return feedbackItem.status;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackByFn(item: any) {
        return item.id;
    }
}
