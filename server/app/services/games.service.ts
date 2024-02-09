import { Game } from '@common/game';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

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
}
