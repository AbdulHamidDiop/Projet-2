import { Feedback } from '@common/feedback';
import { Game } from '@common/game';
import { DB_COLLECTION_GAMES } from '@common/utils/env';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class GamesService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Game> {
        return this.databaseService.database.collection(DB_COLLECTION_GAMES);
    }

    async getAllGames(): Promise<Game[]> {
        const games = await this.collection.find({}).toArray();
        return games;
    }

    async addGame(game: Game): Promise<void> {
        await this.collection.deleteOne({ id: game.id });
        await this.collection.insertOne(game);
    }

    async getGameByID(id: string): Promise<Game> {
        const games: Game[] = await this.getAllGames();
        const game = games.find((g) => g.id === id);
        if (!game) {
            return null;
        }
        return game;
    }

    async toggleGameHidden(id: string): Promise<boolean> {
        let hasChanged = false;
        const games: Game[] = await this.getAllGames();
        games.map(async (game) => {
            if (game.id === id) {
                hasChanged = true;
                await this.collection.updateOne({ id }, { $set: { ...game, lastModification: new Date(), isHidden: !game.isHidden } });
            }
        });
        return hasChanged;
    }

    async deleteGameByID(id: string): Promise<boolean> {
        let gameFound = false;
        const games: Game[] = await this.getAllGames();
        games.filter((game) => {
            if (game.id === id) {
                gameFound = true;
                return false;
            }
            return true;
        });
        if (gameFound) {
            await this.collection.findOneAndDelete({ id });
        }
        return gameFound;
    }

    async getQuestionsWithoutCorrectShown(id: string): Promise<Game> {
        const game: Game = await this.getGameByID(id);
        const questionsWithoutCorrect = game.questions.map((question) => {
            if (question.choices) {
                const choicesWithoutCorrect = question.choices.map((choice) => {
                    const choiceWithoutCorrect = { ...choice };
                    delete choiceWithoutCorrect.isCorrect;
                    return choiceWithoutCorrect;
                });
                return { ...question, choices: choicesWithoutCorrect };
            }
            return question;
        });
        return { ...game, questions: questionsWithoutCorrect };
    }

    async isCorrectAnswer(answer: string[], gameID: string, questionID: string): Promise<boolean> {
        const game: Game = await this.getGameByID(gameID);
        if (!game) {
            return false;
        }
        const question = game.questions.find((q) => q.id === questionID);
        if (question.choices) {
            const correctChoices = question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
            if (answer.length !== correctChoices.length || !answer.every((answr) => correctChoices.includes(answr))) {
                return false;
            }
            return true;
        }
        return true;
    }

    async generateFeedback(gameID: string, questionId: string, submittedAnswers: string[]): Promise<Feedback[]> {
        const game = await this.getGameByID(gameID);
        const question = game.questions.find((q) => q.id === questionId);

        if (!question) {
            throw new Error('Question not found');
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
