import { Feedback } from '@common/feedback';
import { Game } from '@common/game';
import { GameSession } from '@common/game-session';
import { BarChartQuestionStats, QCMStats, QRLGrade } from '@common/game-stats';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const SESSIONS_PATH = './assets/game-sessions.json';
const ZERO_GRADE_MULTIPLER = 0;
const HALF_GRADE_MULTIPLER = 0.5;
const FULL_GRADE_MULTIPLER = 1;

@Service()
export class GameSessionService {
    async getAllSessions(): Promise<GameSession[]> {
        const data: string = await fs.readFile(SESSIONS_PATH, 'utf8');
        return JSON.parse(data);
    }

    async getSessionByPin(pin: string): Promise<GameSession | undefined> {
        const sessions: GameSession[] = await this.getAllSessions();
        return sessions.find((session) => session.pin === pin);
    }

    async createSession(pin: string, game: Game): Promise<GameSession> {
        const statisticsData: BarChartQuestionStats[] = [] as BarChartQuestionStats[];
        const session: GameSession = { pin, game, statisticsData };
        const sessions: GameSession[] = await this.getAllSessions();
        if (sessions.find((s) => s.pin === pin)) {
            return session;
        }
        sessions.push(session);
        await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2), 'utf8');
        return session;
    }

    async deleteSession(pin: string): Promise<void> {
        const sessions: GameSession[] = await this.getAllSessions();
        const updatedSessions = sessions.filter((session) => session.pin !== pin);
        await fs.writeFile(SESSIONS_PATH, JSON.stringify(updatedSessions, null, 2), 'utf8');
    }

    async getGameByPin(pin: string): Promise<Game> {
        const gameSession = await this.getSessionByPin(pin);
        if (gameSession) {
            return gameSession.game;
        }
        return undefined;
    }

    async getQuestionsWithoutCorrectShown(pin: string): Promise<Game> {
        const game: Game = await this.getGameByPin(pin);
        if (game) {
            game.questions.forEach((question) => {
                if (question.choices) {
                    question.choices.forEach((choice) => {
                        delete choice.isCorrect;
                    });
                }
            });
            return game;
        }
        return game;
    }

    async isCorrectAnswer(answer: string[], pin: string, questionID: string): Promise<boolean> {
        const game: Game = await this.getGameByPin(pin);
        if (!game) {
            return false;
        }
        const question = game.questions.find((q) => q.id === questionID);
        if (question && question.choices) {
            const correctChoices = question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
            if (answer.length !== correctChoices.length || !answer.every((answr) => correctChoices.includes(answr))) {
                return false;
            }
            return true;
        }
        return false;
    }

    async generateFeedback(pin: string, questionId: string, submittedAnswers: string[]): Promise<Feedback[]> {
        const game = await this.getGameByPin(pin);
        const question = game.questions.find((q) => q.id === questionId);

        if (!question) {
            return [];
        }

        const feedback: Feedback[] = question.choices.map((choice) => {
            const isSelected = submittedAnswers.includes(choice.text);
            let status: 'correct' | 'incorrect' | 'missed';

            if (isSelected) {
                if (choice.isCorrect) {
                    status = 'correct';
                } else {
                    status = 'incorrect';
                }
            } else if (choice.isCorrect) {
                status = 'missed';
            }

            return { choice: choice.text, status };
        });

        return feedback;
    }

    async updateStatisticsData(pin: string, stat: QCMStats): Promise<void> {
        const gameSession = await this.getSessionByPin(pin);
        if (!gameSession) {
            return;
        }
        const statisticsData = gameSession.statisticsData;

        const index = gameSession.game.questions.findIndex((q) => q.id === stat.questionId);

        if (statisticsData[index]) {
            if (stat.selected) {
                statisticsData[index].data[stat.choiceIndex].data[0]++;
            }
            if (!stat.selected && statisticsData[index].data[stat.choiceIndex].data[0] > 0) {
                statisticsData[index].data[stat.choiceIndex].data[0]--;
            }
        } else {
            const question = gameSession.game.questions.find((q) => q.id === stat.questionId);
            const barChartStat: BarChartQuestionStats = {
                questionID: stat.questionId,
                data: [],
            };
            const correction: Feedback[] = await this.generateFeedback(
                pin,
                question.id,
                question.choices.map((choice) => choice.text),
            );

            for (let i = 0; i < stat.choiceAmount; i++) {
                barChartStat.data.push({
                    data: i === stat.choiceIndex ? [1] : [0],
                    label: question.choices[i].text,
                    backgroundColor: correction[i].status === 'correct' ? '#4CAF50' : '#FF4C4C',
                });
            }
            statisticsData[index] = barChartStat;
        }
        gameSession.statisticsData = statisticsData;

        const sessions = await this.getAllSessions();
        const sessionIndex = sessions.findIndex((session) => session.pin === pin);
        sessions[sessionIndex] = gameSession;
        await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2), 'utf8');
    }

    async updateQRLGradeData(pin: string, qrlGrade: QRLGrade): Promise<void> {
        const gameSession = await this.getSessionByPin(pin);
        if (!gameSession) {
            return;
        }
        const statisticsData = gameSession.statisticsData;
        const questionIndex = gameSession.game.questions.findIndex((q) => q.id === qrlGrade.questionId);

        let barIndex;
        switch (qrlGrade.multiplier) {
            case ZERO_GRADE_MULTIPLER:
                barIndex = 0;
                break;
            case HALF_GRADE_MULTIPLER:
                barIndex = 1;
                break;
            case FULL_GRADE_MULTIPLER:
                barIndex = 2;
                break;
            default:
                return;
        }
        if (statisticsData[questionIndex]) {
            statisticsData[questionIndex].data[barIndex].data[0]++;
        } else {
            statisticsData[questionIndex] = {
                questionID: qrlGrade.questionId,
                data: [
                    { data: [0], label: 'nombre de personnes ayant eu 0', backgroundColor: '#FF4C4C' },
                    { data: [0], label: 'nombre de personnes ayant eu la moitié des points', backgroundColor: '#FFCE56' },
                    { data: [0], label: 'nombre de personnes ayant eu la totalité des points', backgroundColor: '#4CAF50' },
                ],
            };
            statisticsData[questionIndex].data[barIndex].data[0]++;
        }
        gameSession.statisticsData = statisticsData;

        const sessions = await this.getAllSessions();
        const sessionIndex = sessions.findIndex((session) => session.pin === pin);
        sessions[sessionIndex] = gameSession;
        await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2), 'utf8');
    }

    // should only be used to retrieve the stats for the results page in this current implementation
    async getStatisticsData(pin: string): Promise<BarChartQuestionStats[]> {
        const gameSession = await this.getSessionByPin(pin);
        if (gameSession) {
            const statisticsData = this.cleanStatisticsData(gameSession.statisticsData);
            return statisticsData;
        }
        return [];
    }

    cleanStatisticsData(data: BarChartQuestionStats[]): BarChartQuestionStats[] {
        const blankData: BarChartQuestionStats = {
            questionID: '',
            data: [],
        };
        return data.map((item) => {
            return item === undefined ? blankData : item;
        });
    }
}
