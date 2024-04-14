/* eslint-disable max-lines */
/* eslint-disable no-restricted-imports */
import { Game, Player } from '@common/game';
import { expect } from 'chai';
// import { stub } from 'sinon';
import { GameSession } from '@common/game-session';
import { BarChartQuestionStats, QCMStats, QRLGrade } from '@common/game-stats';
import { DB_COLLECTION_HISTORIQUE } from '@common/utils/env';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
import { GameSessionService } from './game-session.service';

const GAME: Game = {
    id: '12345678901',
    lastModification: '2024-02-01T15:04:41.171Z',
    title: 'Questionnaire sur le TS',
    description: 'Questions de pratique sur le langage TypeScript',
    duration: 40,
    questions: [
        {
            id: '1',
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en TS?',
            points: 30,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                },
            ],
        },
    ],
    isHidden: false,
} as unknown as Game;

const SESSION: GameSession = {
    pin: '1122',
    game: {
        id: '46277881345',
        lastModification: '2024-02-01T15:04:41.171Z',
        title: 'Questionnaire sur le JS',
        description: 'Questions de pratique sur le langage JavaScript',
        duration: 59,
        questions: [
            {
                id: '11',
                type: 'QCM',
                text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        text: 'var',
                        isCorrect: true,
                    },
                    {
                        text: 'self',
                        isCorrect: false,
                    },
                    {
                        text: 'this',
                        isCorrect: true,
                    },
                    {
                        text: 'int',
                    },
                ],
            },
            {
                id: '12',
                type: 'QCM',
                text: 'Est-ce que le code suivant lance une erreur : const a = 1/NaN; ? ',
                points: 20,
                choices: [
                    {
                        text: 'Non',
                        isCorrect: true,
                    },
                    {
                        text: 'Oui',
                        isCorrect: false,
                    },
                ],
            },
        ],
        isHidden: false,
    },
    isCompleted: false,
} as unknown as GameSession;

describe('GameSession Service', () => {
    let gameSessionService: GameSessionService;
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        gameSessionService = new GameSessionService(databaseService);
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('getAllSessions should return all sessions', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertMany([SESSION]);
        const sessions = await gameSessionService.getAllSessions();
        expect(sessions.length).to.deep.equal(1);
    });

    it('should filter by pin', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const pin = SESSION.pin;
        const result = await gameSessionService.getSessionByPin(pin);
        expect(result).to.deep.equal(SESSION);
    });

    it('should add session to database', async () => {
        const pin = '2222';
        await gameSessionService.createSession(pin, GAME);
        const sessions = await gameSessionService.getAllSessions();
        expect(sessions.length).to.deep.equal(1);
    });

    it('should not add session with exisitng pin to database', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const pin = SESSION.pin;
        await gameSessionService.createSession(pin, GAME);
        const sessions = await gameSessionService.getAllSessions();
        expect(sessions.length).to.deep.equal(1);
    });

    it('should delete session with exisitng pin from the database', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const pin = SESSION.pin;
        await gameSessionService.deleteSession(pin);
        const sessions = await gameSessionService.getAllSessions();
        expect(sessions.length).to.deep.equal(0);
    });

    it('should return the game corresponding to a certain pin ', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const pin = SESSION.pin;
        const result = await gameSessionService.getGameByPin(pin);
        expect(result).to.deep.equal(SESSION.game);
    });

    it('should get questions without correct answers being shown from pin', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const pin = SESSION.pin;
        const result = await gameSessionService.getQuestionsWithoutCorrectShown(pin);
        expect(result).to.deep.equal({
            id: '46277881345',
            lastModification: '2024-02-01T15:04:41.171Z',
            title: 'Questionnaire sur le JS',
            description: 'Questions de pratique sur le langage JavaScript',
            duration: 59,
            questions: [
                {
                    id: '11',
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 40,
                    choices: [{ text: 'var' }, { text: 'self' }, { text: 'this' }, { text: 'int' }],
                },
                {
                    id: '12',
                    type: 'QCM',
                    text: 'Est-ce que le code suivant lance une erreur : const a = 1/NaN; ? ',
                    points: 20,
                    choices: [{ text: 'Non' }, { text: 'Oui' }],
                },
            ],
            isHidden: false,
        });
    });

    it('should return undefined for wrong pin', async () => {
        const pin = '2222';
        const result = await gameSessionService.getQuestionsWithoutCorrectShown(pin);
        expect(result).to.equal(undefined);
    });

    it('should return true for correct answer', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['var', 'this'];
        const pin = SESSION.pin;
        const questionID = SESSION.game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(true);
    });

    it('should return false for incorrect answer', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['wrong'];
        const pin = SESSION.pin;
        const questionID = SESSION.game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return false for inexistant pin', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['wrong'];
        const pin = '0000';
        const questionID = SESSION.game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return false for inexistant question', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['wrong'];
        const pin = SESSION.pin;
        const questionID = '0000';
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return Feedback for correct, incorrect and missed answers', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['self', 'this'];
        const pin = SESSION.pin;
        const questionID = SESSION.game.questions[0].id;
        const result = await gameSessionService.generateFeedback(pin, questionID, answer);
        expect(result).to.deep.equal([
            { choice: 'var', status: 'missed' },
            { choice: 'self', status: 'incorrect' },
            { choice: 'this', status: 'correct' },
            { choice: 'int', status: undefined },
        ]);
    });

    it('should return empty array for inexisting question', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const answer = ['self', 'this'];
        const pin = SESSION.pin;
        const questionID = 'fake';
        const result = await gameSessionService.generateFeedback(pin, questionID, answer);
        expect(result).to.deep.equal([]);
    });

    it('should return true if completeSession is success', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const bestScore = 10;
        const success = await gameSessionService.completeSession(SESSION.pin, bestScore);
        expect(success).to.deep.equal(true);
    });

    it('should delete all completed sessions from db', async () => {
        const isCompleted = true;
        const pin = '2222';
        const gameCopy = { ...GAME };
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertMany([SESSION, { pin, gameCopy, isCompleted }]);
        await gameSessionService.deleteHistory();
        const sessions = await gameSessionService.getAllSessions();
        expect(sessions.length).to.deep.equal(1);
    });

    it('should return true if addNbPlayers is success', async () => {
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(SESSION);
        const nbPlayers = 4;
        const success = await gameSessionService.addNbPlayers(SESSION.pin, nbPlayers);
        expect(success).to.deep.equal(true);
    });

    it('should update bar chart data on receiving QCM_STATS event', async () => {
        const pin = 'examplePin';
        const mockStat: QCMStats = {
            questionId: '1',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 1,
            correctIndex: 0,
        };
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne({
            pin,
            game: {
                questions: [
                    {
                        id: '1',
                        choices: [
                            {
                                text: 'var',
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            statisticsData: [],
        });

        await gameSessionService.updateStatisticsData(pin, mockStat);

        const updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.statisticsData.length).to.be.greaterThan(0);
        expect(updatedSession.statisticsData[0].data[0].data[0]).to.equal(1);

        await gameSessionService.updateStatisticsData('fakePin', mockStat);
        const unchangedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin: 'examplePin' });
        expect(unchangedSession.statisticsData[0].data[0].data[0]).to.equal(1);
    });

    it('should decrement bar chart data when stat.selected is false and data value is greater than 0', async () => {
        const pin = 'examplePin';
        const decrementStat: QCMStats = {
            questionId: '1',
            choiceIndex: 0,
            selected: false,
            choiceAmount: 2,
            correctIndex: 0,
        };
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne({
            pin,
            game: {
                questions: [
                    {
                        id: '1',
                        choices: [
                            {
                                text: 'var',
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            statisticsData: [{ questionID: '1', data: [{ data: [1], label: 'Choice 1' }] }],
        });

        await gameSessionService.updateStatisticsData(pin, decrementStat);
        const updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.statisticsData[0].data[0].data[0]).to.equal(0);
    });

    it('should update QRL grade data', async () => {
        const pin = 'examplePin';
        const qrlGrade: QRLGrade = { questionId: '1', multiplier: 0, grade: 1, author: 'author' };
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne({ pin, game: { questions: [{ id: '1' }] }, statisticsData: [] });

        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        let updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.statisticsData[0].data[0].data[0]).to.equal(1);

        qrlGrade.multiplier = 0.5;
        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.statisticsData[0].data[1].data[0]).to.equal(1);

        qrlGrade.multiplier = 1;
        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.statisticsData[0].data[2].data[0]).to.equal(1);
    });

    it('getStatisticsData should return statistics data', async () => {
        const pin = 'examplePin';
        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne({
            pin,
            game: { questions: [{ id: '1' }] },
            statisticsData: [{ questionID: '1', data: [{ data: [1], label: 'Choice 1' }] }],
        });

        const result = await gameSessionService.getStatisticsData(pin);
        expect(result).to.deep.equal([{ questionID: '1', data: [{ data: [1], label: 'Choice 1' }] }]);
    });

    it('cleanStatisticsData should fill undefined stats with blank ones', async () => {
        const data: BarChartQuestionStats[] = [undefined, undefined, undefined];
        const result = gameSessionService.cleanStatisticsData(data);
        expect(result).to.deep.equal([
            { questionID: '', data: [] },
            { questionID: '', data: [] },
            { questionID: '', data: [] },
        ]);
    });

    it('should store a new player in the session', async () => {
        const pin = '1122';
        const newPlayer = { name: 'New Player', score: 0, bonusCount: 0 } as Player;
        const session = { pin, game: GAME, players: [] } as GameSession;

        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(session);
        await gameSessionService.storePlayer(pin, newPlayer);

        const updatedSession = await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).findOne({ pin });
        expect(updatedSession.players).to.include.deep.members([newPlayer]);
    });

    it('should get all players in the session and retern empty array if session dosnt exist', async () => {
        const pin = '1122';
        const newPlayer = { name: 'New Player', score: 0, bonusCount: 0 } as Player;
        const session = { pin, game: GAME, players: [newPlayer] } as GameSession;

        await databaseService.db.collection(DB_COLLECTION_HISTORIQUE).insertOne(session);
        const players = await gameSessionService.getPlayers(pin);
        expect(players).to.deep.equal([newPlayer]);

        const players2 = await gameSessionService.getPlayers('fakePin');
        expect(players2).to.deep.equal([]);
    });
});
