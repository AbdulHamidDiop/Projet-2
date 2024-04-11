import { Application } from '@app/app';
import { GameSessionService } from '@app/services/game-session.service';
import { Feedback } from '@common/feedback';
import { Game, Player } from '@common/game';
import { BarChartQuestionStats } from '@common/game-stats';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';

let SESSION_DATA = '';

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

describe('GameSessionController', () => {
    let gameSessionService: SinonStubbedInstance<GameSessionService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        SESSION_DATA = JSON.stringify([
            {
                pin: '1122',
                isCompleted: false,
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
        gameSessionService = createStubInstance(GameSessionService);
        const app = Container.get(Application);
        Object.defineProperty(app['gameSessionController'], 'gameSessionService', { value: gameSessionService });
        expressApp = app.app;
    });
    it('should return all games ', async () => {
        gameSessionService.getAllSessions.resolves(JSON.parse(SESSION_DATA));
        return supertest(expressApp)
            .get('/api/gameSession')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(JSON.parse(SESSION_DATA));
            });
    });

    it('should return game by pin ', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        gameSessionService.getSessionByPin.resolves(JSON.parse(SESSION_DATA)[0]);
        return supertest(expressApp)
            .get(`/api/gameSession/${pin}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(JSON.parse(SESSION_DATA)[0]);
            });
    });

    it('should return NOT FOUND for inexistant pin ', async () => {
        const pin = '0000';
        gameSessionService.getSessionByPin.resolves(null);
        return supertest(expressApp)
            .get(`/api/gameSession/${pin}`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('should create GameSession', async () => {
        const pin = '1111';
        const game = GAME;
        const statisticsData: BarChartQuestionStats[] = [];
        const players: Player[] = [];
        const isCompleted = false;
        gameSessionService.createSession.resolves({ pin, game, statisticsData, players, isCompleted });
        return supertest(expressApp)
            .post(`/api/gameSession/create/${pin}`)
            .set('Content', 'application/json')
            .send(GAME)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal({ pin, game, statisticsData, players, isCompleted });
            });
    });

    it('should delete GameSession', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        gameSessionService.deleteSession.resolves();
        return supertest(expressApp)
            .delete(`/api/gameSession/delete/${pin}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('should get game by pin', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        gameSessionService.getGameByPin.resolves(JSON.parse(SESSION_DATA)[0].game);
        return supertest(expressApp)
            .get(`/api/gameSession/game/${pin}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(JSON.parse(SESSION_DATA)[0].game);
            });
    });

    it('should get questions without answers', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const gameWithoutAnswers = {
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
        } as unknown as Game;
        gameSessionService.getQuestionsWithoutCorrectShown.resolves(gameWithoutAnswers);
        return supertest(expressApp)
            .get(`/api/gameSession/questionswithoutcorrect/${pin}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(gameWithoutAnswers);
            });
    });
    it('should check answers correctly', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        gameSessionService.isCorrectAnswer.resolves(true);
        return supertest(expressApp)
            .post('/api/gameSession/check')
            .set('Content', 'application/json')
            .send({ answer: [], sessionPin: pin, questionID: JSON.parse(SESSION_DATA)[0].game.questions[0].id })
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal({ isCorrect: true });
            });
    });

    it('should return feedback for incorrect input', async () => {
        return supertest(expressApp)
            .post('/api/gameSession/feedback')
            .set('Content', 'application/json')
            .send({})
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                expect(response.body).to.deep.equal({ message: 'Question ID and submitted answers are required.' });
            });
    });

    it('should return feedback for correct input', async () => {
        const pin = JSON.parse(SESSION_DATA)[0].pin;
        const feedback: Feedback[] = [
            { choice: 'var', status: 'missed' },
            { choice: 'self', status: 'incorrect' },
            { choice: 'this', status: 'correct' },
            { choice: 'int', status: 'incorrect' },
        ];
        gameSessionService.generateFeedback.resolves(feedback);
        return supertest(expressApp)
            .post('/api/gameSession/feedback')
            .set('Content', 'application/json')
            .send({ sessionPin: pin, questionID: JSON.parse(SESSION_DATA)[0].game.questions[0].id, submittedAnswers: [] })
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(feedback);
            });
    });

    it('should complete session of an existing session', async () => {
        gameSessionService.completeSession.resolves(true);
        const pin = '1122';
        const bestScore = 10;
        await supertest(expressApp)
            .patch('/api/gameSession/completeSession')
            .set('Content', 'application/json')
            .send({ pin, bestScore })
            .expect(StatusCodes.NO_CONTENT);
    });

    it('should not complete session of an unexisting session', async () => {
        gameSessionService.completeSession.resolves(false);
        const pin = '5235';
        const bestScore = 10;
        await supertest(expressApp)
            .patch('/api/gameSession/completeSession')
            .set('Content', 'application/json')
            .send({ pin, bestScore })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it('should delete all sessions from history', async () => {
        gameSessionService.deleteHistory.resolves();
        await supertest(expressApp).delete('/api/gameSession/deleteHistory').set('Content', 'application/json').send().expect(StatusCodes.NO_CONTENT);
    });

    it('should add number of players to an existing session', async () => {
        gameSessionService.addNbPlayers.resolves(true);
        const pin = '1122';
        const nbPlayers = 4;
        await supertest(expressApp)
            .patch('/api/gameSession/addNbPlayers')
            .set('Content', 'application/json')
            .send({ pin, nbPlayers })
            .expect(StatusCodes.NO_CONTENT);
    });

    it('should not add number of players to an unexisting session', async () => {
        gameSessionService.addNbPlayers.resolves(false);
        const pin = '5235';
        const nbPlayers = 4;
        await supertest(expressApp)
            .patch('/api/gameSession/addNbPlayers')
            .set('Content', 'application/json')
            .send({ pin, nbPlayers })
            .expect(StatusCodes.BAD_REQUEST);
    });
});
