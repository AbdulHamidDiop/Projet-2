/* eslint-disable no-restricted-imports */
import { DB_DB } from '@common/utils/env';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
@Service()
export class DatabaseService {
    db: Db;
    private client: MongoClient;

    get database(): Db {
        return this.db;
    }

    async start(url: string): Promise<void> {
        try {
            this.client = new MongoClient(url);
            await this.client.connect();
            this.db = this.client.db(DB_DB);
        } catch {
            throw new Error('Database connection error');
        }
    }

    async closeConnection(): Promise<void> {
        await this.client.close();
        this.client = undefined;
    }
}
