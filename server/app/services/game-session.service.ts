import { Feedback } from '@common/feedback';
import { Game } from '@common/game';
import { GameSession } from '@common/game-session';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DB_COLLECTION_HISTORIQUE } from '../../utils/env';
import { DatabaseService } from './database.service';

@Service()
export class GameSessionService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<GameSession> {
        return this.databaseService.database.collection(
            DB_COLLECTION_HISTORIQUE
        );
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
        const session: GameSession = { pin, game };
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
            if (session.pin === pin) {
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
}
