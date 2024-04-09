/* eslint-disable max-lines */
import { Game, Player } from '@common/game';
import { GameSession } from '@common/game-session';
import { BarChartQuestionStats, QCMStats, QRLGrade } from '@common/game-stats';
import { expect } from 'chai';
import * as fs from 'fs';
import { SinonStub, stub } from 'sinon';
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

let SESSION_DATA = '';

describe('GameSession Service', () => {
    let gameSessionService: GameSessionService;
    let readFileStub: SinonStub;
    let writeFileStub: SinonStub;

    beforeEach(async () => {
        SESSION_DATA = JSON.stringify([
            {
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
                statisticsData: [],
                players: [],
            },
        ]);
        readFileStub = stub(fs.promises, 'readFile').resolves(SESSION_DATA);
        writeFileStub = stub(fs.promises, 'writeFile').callsFake(async (path: fs.PathLike, data: string) => {
            return new Promise<void>((resolve) => {
                SESSION_DATA = data;
                resolve();
            });
        });

        gameSessionService = new GameSessionService();
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    it('should get sessions from database', async () => {
        const result = await gameSessionService.getAllSessions();
        expect(result).to.deep.equal(JSON.parse(SESSION_DATA));
    });

    it('should filter by pin', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const result = await gameSessionService.getSessionByPin(pin);
        expect(result).to.deep.equal(JSON.parse(SESSION_DATA)[0]);
    });

    it('should add session to database', async () => {
        const pin = '2222';
        const game = GAME;
        const statisticsData: BarChartQuestionStats[] = [];
        const players: Player[] = [];
        const result = await gameSessionService.createSession(pin, GAME);
        expect(result).to.deep.equal({ pin, game, statisticsData, players });
        expect(JSON.parse(SESSION_DATA)).to.be.an('array').with.lengthOf(2);
    });

    it('should not add session with exisitng pin to database', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const game = GAME;
        const statisticsData: BarChartQuestionStats[] = [];
        const players: Player[] = [];

        const result = await gameSessionService.createSession(pin, GAME);
        expect(result).to.deep.equal({ pin, game, statisticsData, players });
        expect(JSON.parse(SESSION_DATA)).to.be.an('array').with.lengthOf(1);
    });

    it('should delete session with exisitng pin from the database', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        await gameSessionService.deleteSession(pin);
        expect(JSON.parse(SESSION_DATA)).to.be.an('array').with.lengthOf(0);
    });

    it('should return the game corresponding to a certain pin ', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const result = await gameSessionService.getGameByPin(pin);
        expect(result).to.deep.equal(JSON.parse(SESSION_DATA)[0].game);
    });

    it('should get questions without correct answers being shown from pin', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
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
        const answer = ['var', 'this'];
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const questionID = JSON.parse(SESSION_DATA)[0].game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(true);
    });

    it('should return false for incorrect answer', async () => {
        const answer = ['wrong'];
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const questionID = JSON.parse(SESSION_DATA)[0].game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return false for inexistant pin', async () => {
        const answer = ['wrong'];
        const pin = '0000';
        const questionID = JSON.parse(SESSION_DATA)[0].game.questions[0].id;
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return false for inexistant question', async () => {
        const answer = ['wrong'];
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const questionID = '0000';
        const result = await gameSessionService.isCorrectAnswer(answer, pin, questionID);
        expect(result).to.equal(false);
    });

    it('should return Feedback for correct, incorrect and missed answers', async () => {
        const answer = ['self', 'this'];
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const questionID = JSON.parse(SESSION_DATA)[0].game.questions[0].id;
        const result = await gameSessionService.generateFeedback(pin, questionID, answer);
        expect(result).to.deep.equal([
            { choice: 'var', status: 'missed' },
            { choice: 'self', status: 'incorrect' },
            { choice: 'this', status: 'correct' },
            { choice: 'int', status: undefined },
        ]);
    });

    it('should return empty array for inexisting question', async () => {
        const answer = ['self', 'this'];
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const questionID = 'fake';
        const result = await gameSessionService.generateFeedback(pin, questionID, answer);
        expect(result).to.deep.equal([]);
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
        readFileStub.resolves(
            JSON.stringify([
                {
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
                },
            ]),
        );

        await gameSessionService.updateStatisticsData(pin, mockStat);

        const updatedSessions = JSON.parse(SESSION_DATA);
        expect(updatedSessions[0].statisticsData.length).to.be.greaterThan(0);
        expect(updatedSessions[0].statisticsData[0].data[0].data[0]).to.equal(1);
        // should immediatly return if gameSession is not found (mainly for coverage)
        await gameSessionService.updateStatisticsData('fakePin', mockStat);
        expect(updatedSessions[0].statisticsData[0].data[0].data[0]).to.equal(1);
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
        readFileStub.resolves(
            JSON.stringify([
                {
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
                },
            ]),
        );

        await gameSessionService.updateStatisticsData(pin, decrementStat);

        const updatedSessions = JSON.parse(SESSION_DATA);
        expect(updatedSessions[0].statisticsData[0].data[0].data[0]).to.equal(0);
    });

    it('should update QRL grade data', async () => {
        const pin = 'examplePin';
        const qrlGrade: QRLGrade = { questionId: '1', multiplier: 0, grade: 1, author: 'author' };
        readFileStub.resolves(JSON.stringify([{ pin, game: { questions: [{ id: '1' }] }, statisticsData: [] }]));

        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        let updatedSessions = JSON.parse(SESSION_DATA);
        expect(updatedSessions[0].statisticsData[0].data[0].data[0]).to.equal(1);

        qrlGrade.multiplier = 0.5;
        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        updatedSessions = JSON.parse(SESSION_DATA);
        expect(updatedSessions[0].statisticsData[0].data[1].data[0]).to.equal(1);

        qrlGrade.multiplier = 1;
        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
        updatedSessions = JSON.parse(SESSION_DATA);
        expect(updatedSessions[0].statisticsData[0].data[2].data[0]).to.equal(1);

        qrlGrade.multiplier = null;
        await gameSessionService.updateQRLGradeData(pin, qrlGrade);
    });

    it('getStatisticsData should return statistics data', async () => {
        const pin = 'examplePin';
        readFileStub.resolves(
            JSON.stringify([
                {
                    pin,
                    game: { questions: [{ id: '1' }] },
                    statisticsData: [{ questionID: '1', data: [{ data: [1], label: 'Choice 1' }] }],
                },
            ]),
        );

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
        const newPlayer = { name: 'New Player', score: 0, bonusCount: 0 } as Player; // Sample new player

        await gameSessionService.storePlayer(pin, newPlayer);

        const updatedSessions = JSON.parse(SESSION_DATA) as GameSession[];
        const session = updatedSessions.find((s) => s.pin === pin);
        expect(session.players).to.include.deep.members([newPlayer]);
    });
});
