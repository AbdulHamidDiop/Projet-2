import { Component, HostListener } from '@angular/core';
import { MatListOption } from '@angular/material/list';
import { TimeService } from '@app/services/time.service';
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
    question = {
        type: 'QCM',
        text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
        points: 40,
        nbChoices: 5,
        choices: [
            {
                text: 'var',
                isCorrect: true,
                index: 'A',
            },
            {
                text: 'self',
                isCorrect: false,
                index: 'B',
            },
            {
                text: 'this',
                isCorrect: true,
                index: 'C',
            },
            {
                text: 'int',
                isCorrect: false,
                index: 'D',
            },
            {
                text: 'private',
                isCorrect: false,
                index: 'E',
            },
        ],
    };

    private isCorrect: boolean;
    private answer: string;
    private readonly timer = 5;
    private points = 0;
    private score = 0;
    constructor(private readonly timeService: TimeService) {
        this.timeService.startTimer(this.timer);
        this.isCorrect = false;
        this.answer = '';
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
            if (this.isCorrect && this.answer !== '') {
                this.score += this.question.points;
            }
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
            this.answer = '';
            this.isCorrect = false;
        } else if (
            this.buttonPressed >= '1' &&
            this.buttonPressed <= '9' &&
            this.question.type === 'QCM' &&
            this.buttonPressed <= this.question.nbChoices.toString()
        ) {
            const index = parseInt(this.buttonPressed, 10);
            this.handleQCMChoice(this.question.choices[index - 1].text, this.question.choices[index - 1].isCorrect);
        }
    }

    handleQCMChoice(answer: string, isCorrect: boolean) {
        if (answer === this.answer) {
            this.answer = '';
            this.isCorrect = false;
        } else {
            this.isCorrect = isCorrect;
            this.answer = answer;
        }
    }

    isChoice(choice: string): boolean {
        return this.answer === choice;
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
        if (this.isCorrect && this.answer !== '') {
            this.score += this.question.points;
        }
        this.timeService.stopTimer();
        this.timeService.startTimer(this.timer);
        this.answer = '';
        this.isCorrect = false;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
        }
    }

    getStyle(choice: string) {
        if (choice === this.answer) {
            return 'selected';
        } else {
            return '';
        }
    }
}
