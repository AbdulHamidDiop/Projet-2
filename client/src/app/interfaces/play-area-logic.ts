import { Feedback } from '@common/feedback';
import { Question } from '@common/game';
import { QCMStats } from '@common/game-stats';

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
}
