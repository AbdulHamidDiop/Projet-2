import { Game } from '@common/game';
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
        const result = await gameSessionService.createSession(pin, GAME);
        expect(result).to.deep.equal({ pin, game });
        expect(JSON.parse(SESSION_DATA)).to.be.an('array').with.lengthOf(2);
    });

    it('should not add session with exisitng pin to database', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const game = GAME;
        const result = await gameSessionService.createSession(pin, GAME);
        expect(result).to.deep.equal({ pin, game });
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
});
