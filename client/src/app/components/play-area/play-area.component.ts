import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatListOption } from '@angular/material/list';
import { QuestionsService } from '@app/services/questions.service';
import { TimeService } from '@app/services/time.service';
import { Question, Type } from '@common/game';
// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;

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
    private readonly timer = 25;
    private points = 0;
    private score = 0;
    constructor(
        private readonly timeService: TimeService,
        private readonly questionService: QuestionsService,
        private cdr: ChangeDetectorRef,
    ) {
        this.timeService.startTimer(this.timer);
        this.isCorrect = [];
        this.answer = [];
    }

    // Devra être changé plus tard.
    get time(): number {
        if (this.timeService.time === 0) this.updateScore();
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
            this.updateScore();
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

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        this.question = this.questionService.question;
        if (this.question.type === Type.QCM) {
            this.nbChoices = this.question.choices.length;
        }
    }

    nextQuestion() {
        const newQuestion = this.questionService.question;
        this.question = newQuestion;
        this.answer = [];
        this.isCorrect = [];
        if (newQuestion && newQuestion.type === 'QCM') {
            this.nbChoices = this.question.choices.length;
        }
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

    handleQRLAnswer(answer: string) {
        if (answer === 'B') {
            alert('La réponse correcte a été choisie');
        }
    }

    focusOnOption(option: MatListOption) {
        option.focus();
    }

    updateScore() {
        let correctAnswer = false;
        for (let i = 0; i < this.isCorrect.length && this.isCorrect.length === this.answer.length; i++) {
            if (this.isCorrect[i]) {
                correctAnswer = true;
            } else {
                correctAnswer = false;
            }
        }
        if (correctAnswer) {
            this.score += this.question.points;
        }
        this.timeService.stopTimer();
        this.timeService.startTimer(this.timer);
        this.answer = [];
        this.isCorrect = [];
        this.nextQuestion();
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choice: string) {
        if (this.answer.includes(choice)) {
            return 'selected';
        } else {
            return '';
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackByFn(item: any) {
        return item.id;
    }
}
