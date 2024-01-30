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
            // throw new Error('Game not found');
            return null;
        }
        return game;
    }

    async toggleGameHidden(id: string): Promise<boolean> {
        const games: Game[] = await this.getAllGames();
        const updatedGames: Game[] = games.map((game) =>
            game.id === id ? { ...game, lastModification: new Date(), isHidden: !game.isHidden } : game,
        );
        await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
        return true;
    }

    async deleteGameByID(id: string): Promise<boolean> {
        const games: Game[] = await this.getAllGames();
        const updatedGames: Game[] = games.filter((game) => game.id !== id);
        await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
        return true;
    }
}
