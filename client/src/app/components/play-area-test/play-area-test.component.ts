import { Component, HostListener } from '@angular/core';
import { MatListOption } from '@angular/material/list';
import { QuestionsService } from '@app/services/questions.service';
import { TimeService } from '@app/services/time.service';
import { Question, Type } from '@common/game';
import { Router } from '@angular/router';

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
    selector: 'app-play-area-test',
    templateUrl: './play-area-test.component.html',
    styleUrls: ['./play-area-test.component.scss'],
})
export class PlayAreaComponent {
    buttonPressed = '';
    question: Question;

    private isCorrect: boolean;
    private answer: string;
    private readonly timer = 25;
    private points = 0;
    private score = 0;
    private nbChoices = 0;
    constructor(
        private readonly timeService: TimeService,
        private readonly questionService: QuestionsService,
        private readonly router: Router,
    ) {
        this.timeService.startTimer(this.timer);
        this.isCorrect = false;
        this.answer = '';
        this.questionService.getAllQuestions();
        this.question = this.questionService.question;
        this.nbChoices = this.question.choices.length;
        const nbMaxQuestionsQCM = 10;
        for (let i = this.question.choices.length; i < nbMaxQuestionsQCM; i++) {
            this.question.choices.push({ text: '', isCorrect: false });
        }
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
            /* if (this.isCorrect && this.answer !== '') {
                this.score += this.question.points;
            }
            this.timeService.stopTimer();
            this.timeService.startTimer(this.timer);
            this.answer = '';
            this.isCorrect = false;*/
            this.updateScore();
        } else if (
            this.buttonPressed >= '1' &&
            this.buttonPressed <= '9' &&
            this.question.type === Type.QCM &&
            this.buttonPressed <= this.nbChoices.toString()
        ) {
            const index = parseInt(this.buttonPressed, 10);
            this.handleQCMChoice(this.question.choices[index - 1].text, this.question.choices[index - 1].isCorrect);
        }
    }

    shouldRender(text: string) {
        return text !== '';
    }

    nextQuestion() {
        this.answer = '';
        this.isCorrect = false;
        const question = this.questionService.question;
        this.nbChoices = question.choices.length;
        this.question.text = question.text;
        for (let i = 0; i < question.choices.length; i++) {
            this.question.choices[i].text = question.choices[i].text;
            this.question.choices[i].isCorrect = question.choices[i].isCorrect;
        }
        for (let i = question.choices.length; i < this.question.choices.length; i++) {
            this.question.choices[i].text = '';
            this.question.choices[i].isCorrect = false;
        }
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
        if (this.question.type === "QCM"){
            if (this.isCorrect && this.answer !== '') {
                this.score = this.score * 1.2;
                
            }
        } else {
            this.score += this.question.points;
        }
        this.timeService.stopTimer();
        this.timeService.startTimer(this.timer);
        this.answer = '';
        this.isCorrect = false;
        this.endGameTest();
        this.presentNextQuestion();
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

    presentNextQuestion() {
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    }

    endGameTest() {
        if (this.questionService.currentQuestionIndex + 1 === this.questionService.questions.length){
            setTimeout(() => {
                this.router.navigate(['/createGame']); 
            }, 3000);
        }
    }
}
