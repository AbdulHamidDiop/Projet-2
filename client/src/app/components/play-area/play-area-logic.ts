import { MatSnackBar } from '@angular/material/snack-bar';
import { BONUS_MULTIPLIER, SHOW_FEEDBACK_DELAY } from '@app/components/play-area/const';
import { PlayerService } from '@app/services/player.service';
import { START_GAME_DELAY } from '@common/consts';
import { Feedback } from '@common/feedback';
import { Player, Question, Type } from '@common/game';
import { QCMStats, QRLAnswer } from '@common/game-stats';

export class PlayAreaLogic {
    inTestMode: boolean = false;
    inRandomMode: boolean = false;
    buttonPressed: string = '';
    question: Question = {} as Question;

    answer: string[] = [];
    qrlAnswer: string = '';
    nbChoices: number;
    score: number = 0;

    showPoints: boolean = false;
    pointsGained: number = 0;
    showCountDown: boolean = false;
    countDownKey: number = Date.now(); // to force change dete/ctiosn
    choiceDisabled: boolean = false;
    feedback: Feedback[];
    answerStat: QCMStats;
    bonusGiven: boolean = false;
    gotBonus: boolean = false;
    movingToNextQuestion: boolean = false;

    constructor(
        private snackBar: MatSnackBar,
        private playerService: PlayerService,
    ) {}

    prepNextQuestion(): void {
        this.answer = [];
        this.feedback = [];
        this.qrlAnswer = '';
        this.movingToNextQuestion = false;
    }

    prepAnswerStat(answer: string, player: Player): void {
        const ERROR_INDEX = -1;
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

        if (!this.question?.choices) {
            return;
        }

        this.answerStat = {
            questionId: this.question.id,
            choiceIndex: this.question.choices.findIndex((c) => c.text === answer),
            correctIndex: this.question.choices.find((choice) => choice.isCorrect)?.index ?? ERROR_INDEX,
            choiceAmount: this.nbChoices,
            selected: !choiceInList,
            player,
        };
    }

    prepQRLAnswer() {
        this.choiceDisabled = true;

        const qrlAnswer: QRLAnswer = {
            questionId: this.question.id,
            author: this.playerService.player.name,
            answer: this.qrlAnswer,
        };
        this.snackBar.open('Votre réponse a été envoyée pour correction, veuillez patienter', 'Fermer', {
            duration: START_GAME_DELAY,
            verticalPosition: 'top',
        });
        return qrlAnswer;
    }

    calculateScore(isCorrectAnswer: boolean): void {
        if (isCorrectAnswer && this.question.points) {
            if (this.inTestMode || this.gotBonus) {
                const pointsWithBonus = this.question.points * (1 + BONUS_MULTIPLIER);
                this.score += pointsWithBonus;
                this.pointsGained = pointsWithBonus;
                this.playerService.player.bonusCount++;
                this.snackBar.open('Bravo! Vous avez obtenu le point bonus!', 'Fermer', {
                    duration: 3000,
                });
            } else {
                this.score += this.question.points;
                this.pointsGained = this.question.points;
            }

            this.showPoints = true;
            setTimeout(() => {
                this.showPoints = false;
            }, SHOW_FEEDBACK_DELAY);

            this.bonusGiven = false;
            this.gotBonus = false;
            this.playerService.player.score = this.score;
        }
    }

    getStyle(choiceText: string): string {
        if (!this.feedback) return '';
        const feedbackItem = this.feedback?.find((f) => f.choice === choiceText);
        if (!feedbackItem) return '';

        return feedbackItem.status;
    }

    isCorrectKeyBoardInput() {
        return (
            this.buttonPressed >= '1' &&
            this.buttonPressed <= '4' &&
            this.question.type === Type.QCM &&
            this.buttonPressed <= this.nbChoices.toString()
        );
    }
}
