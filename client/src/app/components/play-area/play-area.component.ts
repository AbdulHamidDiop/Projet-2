import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { QuestionsService } from '@app/services/questions.service';
import { TimeService } from '@app/services/time.service';
import { Question, Type } from '@common/game';
// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export const SHOW_FEEDBACK_DELAY = 2500;

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
    buttonPressed = '';
    question: Question = {} as Question;

    isCorrect: boolean[] = [];
    answer: string[] = [];
    nbChoices: number;
    score = 0;

    disableChoices = false;
    showFeedback = false;
    private readonly timer = 25;
    private points = 0;
    // eslint-disable-next-line max-params
    constructor(
        readonly timeService: TimeService,
        private readonly questionService: QuestionsService,
        private cdr: ChangeDetectorRef,
        public abortDialog: MatDialog,
        public router: Router,
    ) {
        this.timeService.startTimer(this.timer);
        this.isCorrect = [];
        this.answer = [];
        this.question = this.questionService.question;
        if (this.question.type === Type.QCM) {
            this.nbChoices = this.question.choices.length;
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
            this.handleQCMChoice(this.question.choices[index - 1].text, this.question.choices[index - 1].isCorrect);
        }
    }

    shouldRender(text: string) {
        return text !== '';
    }

    nextQuestion() {
        const newQuestion = this.questionService.question;
        this.question = newQuestion;
        this.answer = [];
        this.isCorrect = [];
        if (newQuestion && newQuestion.type === 'QCM') {
            this.nbChoices = this.question.choices.length;
        }
        this.timeService.stopTimer();
        this.timeService.startTimer(this.timer);
        this.cdr.detectChanges();
    }

    handleQCMChoice(answer: string, isCorrect: boolean) {
        let choiceInList = false;
        for (let i = 0; i < this.answer.length; i++) {
            if (answer === this.answer[i]) {
                this.answer.splice(i, 1);
                this.isCorrect.splice(i, 1);
                choiceInList = true;
                i--;
                break;
            }
        }
        if (!choiceInList) {
            this.answer.push(answer);
            this.isCorrect.push(isCorrect);
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

    confirmAnswers() {
        this.disableChoices = true;

        this.showFeedback = true;

        setTimeout(() => {
            this.updateScore();
            this.showFeedback = false;
            this.disableChoices = false;
            this.nextQuestion();
        }, SHOW_FEEDBACK_DELAY);
    }

    updateScore() {
        let correctAnswer = true;
        if (this.question.choices) {
            const correctChoices = this.question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
            if (this.answer.length !== correctChoices.length || !this.answer.every((answer) => correctChoices.includes(answer))) {
                correctAnswer = false;
            }
        }

        if (correctAnswer && this.question.points) {
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
                this.isCorrect = [];
                this.router.navigate(['/createGame']);
            }
        });
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choice: string): string {
        if (!this.showFeedback) return '';

        const isCorrect = this.question.choices.find((c) => c.text === choice)?.isCorrect ?? false;
        const isSelected = this.answer.includes(choice);

        if (isSelected) {
            return isCorrect ? 'correct' : 'incorrect';
        } else if (isCorrect) {
            return 'missed';
        }
        return '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackByFn(item: any) {
        return item.id;
    }
}
