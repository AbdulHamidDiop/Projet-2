import { Game, Question } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats, QCMStats, QRLAnswer, QRLStats } from '@common/game-stats';

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

    updateQRLStats(stat: QRLStats): void {
        const index = this.statisticsData.findIndex((questionStat) => questionStat.questionID === stat.questionId);
        if (index >= 0) {
            if (stat.edited) {
                this.statisticsData[index].data[0].data[0]++;
            } else if (this.statisticsData[index].data[0].data[0] > 0) {
                this.statisticsData[index].data[0].data[0]--;
            }
            this.statisticsData[index].data[1].data[0] = this.playersLeft - this.statisticsData[index].data[0].data[0];
        } else {
            const initialCount = stat.edited ? 1 : 0;
            this.statisticsData.push({
                questionID: stat.questionId,
                data: [
                    {
                        data: [initialCount],
                        label: 'Nombre de personnes ayant modifié leur réponse dans les 5 dernières secondes',
                        backgroundColor: '#4CAF50',
                    },
                    {
                        data: [this.playersLeft - initialCount],
                        label: "Nombre de personnes n'ayant pas modifié leur réponse dans les 5 dernières secondes",
                        backgroundColor: '#FFCE56',
                    },
                ],
            });
        }
        this.barChartData = this.statisticsData[this.questionIndex]?.data;
    }

    prepNextQuestion(): void {
        this.questionIndex++;
        this.gradingAnswers = false;
        this.qRLAnswers = [];
        this.disableControls = false;
        this.nConfirmations = 0;
        this.disableNextQuestion = true;
    }
}
