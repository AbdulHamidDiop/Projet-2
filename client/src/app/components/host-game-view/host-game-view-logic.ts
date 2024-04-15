import { Game, Question } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats, QRLAnswer } from '@common/game-stats';

export class HostGameViewLogic {
    game: Game;
    timer: number;
    currentQuestion: Question;
    stats: QCMStats[];
    statisticsData: BarChartQuestionStats[] = [];
    barChartData: BarChartChoiceStats[] = [];
    gradingAnswers: boolean = false;
    currentQRLAnswer: QRLAnswer;
    qRLAnswers: QRLAnswer[] = [];
    questionIndex: number = 0;
    showCountDown: boolean = false;
    onLastQuestion: boolean = false;
    playersLeft: number;
    displayPlayerList = true;
    unitTesting: boolean = false;
    disableControls: boolean = false;
    disableNextQuestion: boolean = true;
    nConfirmations: number = 0;
    questionLoaded: boolean = false;
    inPanicMode: boolean = false;
    timerPaused: boolean = false;
}
