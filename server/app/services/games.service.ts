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
}
