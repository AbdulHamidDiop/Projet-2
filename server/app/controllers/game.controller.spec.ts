import { Application } from '@app/app';
import { GamesService } from '@app/services/games.service';
import { Game } from '@common/game';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, assert, createStubInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    const gamesList = [
        {
            id: '8b8909d5-65d2-4370-b78e-c4211bb86eb9',
            lastModification: '2024-02-01T15:04:47.178Z',
            title: 'Les stars les plus connus du Royaume-Uni',
            description: 'Questaqions de pratique sur le langage JavaScript',
            duration: 60,
            questions: [
                {
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
                    type: 'QCM',
                    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
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
                {
                    type: 'QRL',
                    text: 'test mod',
                    points: 20,
                    addToBank: true,
                    id: '43ec3b8f-2221-4f6d-9477-23054f71fe47',
                    lastModification: '2024-01-30T22:34:16.468Z',
                },
            ],
            isHidden: false,
        },
        {
            id: '9a9010c6-65d2-4370-b78e-c4211bb86eb9',
            lastModification: '2024-02-02T15:28:59.795Z',
            title: 'Quiz 1',
            description: 'quiz',
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
                    lastModification: '2024-01-31T16:39:55.649Z',
                },
            ],
            isHidden: true,
        },
        {
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
        },
    ];

    const fakeGame = {
        id: '00000000-1111-2222-test-111111111111',
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

    let gamesService: SinonStubbedInstance<GamesService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        gamesService = createStubInstance(GamesService);
        const app = Container.get(Application);
        Object.defineProperty(app['gamesController'], 'gamesService', { value: gamesService });
        expressApp = app.app;
    });

    it('should return all games ', async () => {
        gamesService.getAllGames.resolves(gamesList as unknown as Game[]);
        return supertest(expressApp)
            .get('/api/game')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(gamesList);
            });
    });

    it('should add a game to db on valid post request to /importgame ', async () => {
        gamesService.addGame.resolves();
        return supertest(expressApp).post('/api/game/importgame').send(gamesList[1]).set('Content', 'application/json').expect(StatusCodes.CREATED);
    });

    it('should change a game in db on valid post request to /edit ', async () => {
        gamesService.addGame.resolves();
        return supertest(expressApp).put('/api/game/edit').send(gamesList[1]).set('Content', 'application/json').expect(StatusCodes.NO_CONTENT);
    });

    it('should get a game by id from db ', async () => {
        gamesService.getGameByID.resolves(gamesList[2] as unknown as Game);
        const gameId = '00000000-1111-2222-test-000000000000';
        return supertest(expressApp)
            .get(`/api/game/${gameId}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                assert.calledWith(gamesService.getGameByID, gameId);
                expect(response.body).to.deep.equal(gamesList[2]);
            });
    });

    it('should respond with 404 if question ID does not exist', async () => {
        const fakeGameId = 'test';
        gamesService.getGameByID.resolves(null);
        return supertest(expressApp)
            .get(`/api/game/${fakeGameId}`)
            .expect(StatusCodes.NOT_FOUND)
            .then(() => {
                assert.calledWith(gamesService.getGameByID, fakeGameId);
            });
    });

    it('should toggle an existing games isHidden attribute ', async () => {
        gamesService.toggleGameHidden.resolves(true);
        return supertest(expressApp)
            .patch('/api/game/togglehidden')
            .set('Content', 'application/json')
            .send(gamesList[2])
            .expect(StatusCodes.NO_CONTENT)
            .then(() => {
                assert.calledWith(gamesService.toggleGameHidden, gamesList[2].id);
            });
    });

    it('should return 400 if an unexisting game is toggled ', async () => {
        gamesService.toggleGameHidden.resolves(false);
        return supertest(expressApp)
            .patch('/api/game/togglehidden')
            .set('Content', 'application/json')
            .send(fakeGame)
            .expect(StatusCodes.BAD_REQUEST)
            .then(() => {
                assert.calledWith(gamesService.toggleGameHidden, fakeGame.id);
            });
    });

    it('Should delete a question from the database', async () => {
        const gameId = '00000000-1111-2222-test-000000000000';
        gamesService.deleteGameByID.resolves(true);

        return supertest(expressApp)
            .delete(`/api/game/delete/${gameId}`)
            .expect(StatusCodes.NO_CONTENT)
            .then(() => {
                assert.calledWith(gamesService.deleteGameByID, gameId);
            });
    });
    it('Should respond with 404 if question ID does not exist', async () => {
        const fakeGameId = 'test';
        gamesService.deleteGameByID.resolves(false);

        return supertest(expressApp)
            .delete(`/api/game/delete/${fakeGameId}`)
            .expect(StatusCodes.NOT_FOUND)
            .then(() => {
                assert.calledWith(gamesService.deleteGameByID, fakeGameId);
            });
    });
});
