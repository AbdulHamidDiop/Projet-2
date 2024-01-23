import { Game } from '@common/game';
import { Message } from '@common/message';
import * as fs from 'fs/promises';
import { Service } from 'typedi';

const PASSWORD: String = "LOG2990-312"
const QUIZ_PATH = "./assets/quiz-example.json"


@Service()
export class AdminService {

    checkPassword(password: String): Message {
        return {
            title: 'Correct Password',
            body: (password == PASSWORD).toString(),
        };
    }

    async addGame(game: Game): Promise<Boolean> {
        try{ 
            const games: Game[] = await this.getAllGames();
            games.push(game);
            await fs.writeFile(QUIZ_PATH, JSON.stringify(games, null, 2), 'utf8');
            return true;
        }
        catch (error) {
            throw error;
        }
    }

    async getAllGames(): Promise<Game[]> {
        try {
            const data: string = await fs.readFile(QUIZ_PATH, 'utf8');
            const games: Game[] = JSON.parse(data);
            return games;
        } catch (error) {
            throw error;
        }
    }

    async getGameByID(id: String): Promise<Game>{
        const games: Game[] = await this.getAllGames();
        return games.find((game) => game.id === id);

    }

    async toggleHidden(id: String): Promise<Boolean> {
        try{ 
            const games: Game[] = await this.getAllGames();
            const updatedGames: Game[] = games.map((game) =>
            game.id === id ? { ...game, lastModification: new Date(), isHidden: !game.isHidden } : game
            );
            await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
            return true;
        }
        catch (error) {
            throw error;
        }
    }

    async deleteGameByID(id: String): Promise<Boolean>{
        try {
            const games: Game[] = await this.getAllGames();
            const updatedGames: Game[] = games.filter((game) => game.id !== id);
            await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
            return true;
        } catch (error) {
            throw error;
        }
    }
}
    