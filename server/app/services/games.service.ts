import { Game } from '@common/game';
import * as fs from 'fs/promises';
import { Service } from 'typedi';
import { Feedback } from './../../../common/feedback';

const QUIZ_PATH = './assets/quiz-example.json';

@Service()
export class GamesService {
    async getAllGames(): Promise<Game[]> {
        const data: string = await fs.readFile(QUIZ_PATH, 'utf8');
        const games: Game[] = JSON.parse(data);
        return games;
    }

    async addGame(game: Game): Promise<void> {
        const games: Game[] = await this.getAllGames();
        if (games.find((g) => g.id === game.id)) {
            games.splice(
                games.findIndex((g) => g.id === game.id),
                1,
            );
        }
        games.push(game);
        await fs.writeFile(QUIZ_PATH, JSON.stringify(games, null, 2), 'utf8');
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
        const updatedGames: Game[] = games.map((game) => {
            if (game.id === id) {
                hasChanged = true;
                return { ...game, lastModification: new Date(), isHidden: !game.isHidden };
            } else {
                return game;
            }
        });
        if (hasChanged) {
            await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
            return hasChanged;
        } else {
            return false;
        }
    }

    async deleteGameByID(id: string): Promise<boolean> {
        let gameFound = false;
        const games: Game[] = await this.getAllGames();
        const updatedGames: Game[] = games.filter((game) => {
            if (game.id === id) {
                gameFound = true;
                return false;
            }
            return true;
        });
        if (gameFound) {
            await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
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
            return question; //  Add this line to return the question if it doesn't have choices
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
