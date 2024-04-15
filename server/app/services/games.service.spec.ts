/* eslint-disable no-restricted-imports */
import { Game } from '@common/game';
import { DB_COLLECTION_GAMES } from '@common/utils/env';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
import { GamesService } from './games.service';

const FIRST_QUIZ = {
    id: '00000000-1111-2222-test-000000000000',
    lastModification: '2024-02-02T15:28:59.795Z',
    title: 'test',
    description: 'test',
    duration: 40,
    questions: [
        {
            type: 'QCM',
            text: 'Quelle est la différence entre NodeJS et Angular',
            points: 20,
            addToBank: true,
            choices: [
                {
                    text: 'Angular = front-end, NodeJS = back-end',
                    isCorrect: false,
                },
                {
                    text: 'Angular = back-end, NodeJS = front-end',
                    isCorrect: true,
                },
                {
                    text: 'Aucune de ces réponses',
                    isCorrect: false,
                },
            ],
            id: 'e6547406-2543-4683-b0a2-dc0f1b01df66',
            lastModification: '2024-01-25T16:09:35.649Z',
        },
    ],
    isHidden: true,
};

const SECOND_QUIZ = {
    id: '10000000-1111-2222-test-000000000000',
    lastModification: '2024-02-02T15:28:59.795Z',
    title: 'test',
    description: 'test',
    duration: 40,
    questions: [
        {
            type: 'QCM',
            text: 'Quelle est la différence entre NodeJS et Angular',
            points: 20,
            addToBank: true,
            id: 'f6547406-2543-4683-b0a2-dc0f1b01df66',
            lastModification: '2024-01-25T16:09:35.649Z',
        },
    ],
    isHidden: true,
};

describe('Games Service', () => {
    let gameService: GamesService;
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        gameService = new GamesService(databaseService);
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('getAllGames should return all games', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertMany([FIRST_QUIZ, SECOND_QUIZ]);
        const games = await gameService.getAllGames();
        expect(games.length).to.deep.equal(2);
    });

    it('should add a game to the database', async () => {
        const quiz = { ...FIRST_QUIZ, title: 'Title' } as unknown as Game;
        await gameService.addGame(quiz);
        const games = await gameService.getAllGames();
        expect(games.length).to.deep.equal(1);
    });

    it('should get a game from the database based on its id', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        const game = await gameService.getGameByID(FIRST_QUIZ.id);
        expect(game).to.deep.equal(FIRST_QUIZ);
    });

    it('should return null if the id is not in the database', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        const game = await gameService.getGameByID('fakeID');
        expect(game).to.equal(null);
    });

    it('should not toggle any game if the id is not in the list', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        const success = await gameService.toggleGameHidden('fakeID');
        expect(success).to.equal(false);
    });

    it('should toggle a games isHidden in the database based on its id', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        const success = await gameService.toggleGameHidden(FIRST_QUIZ.id);
        expect(success).to.equal(true);
    });

    it('should not delete a game from the database if fake id', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        await gameService.deleteGameByID('FakeID');
        const games = await gameService.getAllGames();
        expect(games.length).to.deep.equal(1);
    });

    it('should delete a game from the database based on its id', async () => {
        await databaseService.db.collection(DB_COLLECTION_GAMES).insertOne(FIRST_QUIZ);
        await gameService.deleteGameByID(FIRST_QUIZ.id);
        const games = await gameService.getAllGames();
        expect(games.length).to.deep.equal(0);
    });
});
