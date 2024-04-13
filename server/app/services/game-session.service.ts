/* eslint-disable no-restricted-imports */
/* eslint-disable prefer-const */
import { Feedback } from '@common/feedback';
import { Game, Player } from '@common/game';
import { GameSession } from '@common/game-session';
import { BarChartQuestionStats, QCMStats, QRLGrade } from '@common/game-stats';
import { DB_COLLECTION_HISTORIQUE } from '@common/utils/env';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const ZERO_GRADE_MULTIPLER = 0;
const HALF_GRADE_MULTIPLER = 0.5;
const FULL_GRADE_MULTIPLER = 1;

@Service()
export class GameSessionService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<GameSession> {
        return this.databaseService.database.collection(DB_COLLECTION_HISTORIQUE);
    }

    async getAllSessions(): Promise<GameSession[]> {
        const games = await this.collection.find({}).toArray();
        return games;
    }

    async getSessionByPin(pin: string): Promise<GameSession | undefined> {
        const sessions: GameSession[] = await this.getAllSessions();
        return sessions.find((session) => session.pin === pin);
    }

    async createSession(pin: string, game: Game): Promise<GameSession> {
        const isCompleted = false;
        const session: GameSession = { pin, game, isCompleted, players: [], statisticsData: [] };
        const sessions: GameSession[] = await this.getAllSessions();
        if (sessions.find((s) => s.pin === pin)) {
            return session;
        }
        await this.collection.insertOne(session);
        return session;
    }

    async deleteSession(pin: string): Promise<void> {
        let gameFound = false;
        const sessions: GameSession[] = await this.getAllSessions();
        sessions.filter((session) => {
            if (session.pin === pin && !session.isCompleted) {
                gameFound = true;
                return false;
            }
            return true;
        });
        if (gameFound) {
            await this.collection.findOneAndDelete({ pin });
        }
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
        const question = game?.questions.find((q) => q.id === questionId);

        if (!question || !game) {
            return [];
        }
        const feedback: Feedback[] = question.choices?.map((choice) => {
            const isSelected = submittedAnswers.includes(choice.text);
            const status: 'correct' | 'incorrect' | 'missed' = isSelected
                ? choice.isCorrect
                    ? 'correct'
                    : 'incorrect'
                : choice.isCorrect
                ? 'missed'
                : undefined;

            return { choice: choice.text, status };
        });

        return feedback;
    }

    async completeSession(pin: string, bestScore: number): Promise<boolean> {
        let hasChanged = false;
        const sessions: GameSession[] = await this.getAllSessions();
        sessions.map(async (session) => {
            if (session.pin === pin) {
                hasChanged = true;
                await this.collection.updateOne({ pin }, { $set: { ...session, isCompleted: true, bestScore } });
            }
        });
        return hasChanged;
    }

    async deleteHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async addNbPlayers(pin: string, nbPlayers: number): Promise<boolean> {
        let hasChanged = false;
        const sessions: GameSession[] = await this.getAllSessions();
        sessions.map(async (session) => {
            if (session.pin === pin) {
                hasChanged = true;
                await this.collection.updateOne({ pin }, { $set: { ...session, nbPlayers, timeStarted: new Date() } });
            }
        });
        return hasChanged;
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
        await this.collection.updateOne(
            { pin },
            {
                $set: {
                    statisticsData,
                },
            },
        );
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
        await this.collection.updateOne(
            { pin },
            {
                $set: {
                    statisticsData,
                },
            },
        );
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
            return item ?? blankData;
        });
    }

    async storePlayer(pin: string, player: Player): Promise<void> {
        await this.collection.updateOne({ pin }, { $push: { players: player } });
    }

    async getPlayers(pin: string): Promise<Player[]> {
        const session = await this.getSessionByPin(pin);
        if (session) {
            return session.players;
        }
        return [];
    }
}
