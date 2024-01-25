import { Game } from '@common/game';
import { Message } from '@common/message';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const PASSWORD = 'LOG2990-312';
const QUIZ_PATH = './assets/quiz-example.json';

@Service()
export class AdminService {
    checkPassword(password: string): Message {
        return {
            title: 'Correct Password',
            body: (password === PASSWORD).toString(),
        };
    }

    async addGame(game: Game): Promise<boolean> {
        const games: Game[] = await this.getAllGames();
        games.push(game);
        await fs.writeFile(QUIZ_PATH, JSON.stringify(games, null, 2), 'utf8');
        return true;
    }

    async getAllGames(): Promise<Game[]> {
        const data: string = await fs.readFile(QUIZ_PATH, 'utf8');
        const games: Game[] = JSON.parse(data);
        return games;
    }

    async getGameByID(id: string): Promise<Game> {
        const games: Game[] = await this.getAllGames();
        return games.find((game) => game.id === id);
    }

    async toggleHidden(id: string): Promise<boolean> {
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
    