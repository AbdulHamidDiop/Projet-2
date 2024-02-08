import { Game } from '@common/game';
import { FIRST_QUIZ, TEST_QUIZ } from 'assets/test-data/quiz';
import { expect } from 'chai';
import fs, { PathOrFileDescriptor } from 'fs';
import sinon from 'sinon';
import { GamesService } from './games.service';
const DATALENGTH = 2;
let QUIZ = [
    {
        id: '462778813469',
        title: 'Trivia des top 50 artistes des années 2000',
        description: 'Questaqions de pratique sur le langage JavaScript',
        duration: 60,
        lastModification: '2024-02-02T17:56:00.555Z',
        isHidden: true,
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
        ],
    },
    {
        id: '462778813470',
        title: 'Drapeaux du monde',
        description: 'Questaqions de pratique sur le langage JavaScript',
        duration: 60,
        lastModification: '2024-02-01T15:04:37.203Z',
        isHidden: false,
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
        ],
    },
];

describe('Games Service', () => {
    let gamesService: GamesService;
    let readFileStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;

    beforeEach(async () => {
        readFileStub = sinon.stub(fs, 'readFile').resolves(JSON.stringify(QUIZ));
        writeFileStub = sinon
            .stub(fs, 'writeFile')
            .callsFake((path: PathOrFileDescriptor, data: string, callback) => {
                QUIZ = JSON.parse(data);
                callback(null);
            })
            .resolves();

        gamesService = new GamesService();
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    it('should get all games', async () => {
        gamesService.getAllGames().then((games) => {
            expect(games).to.be.an('array').with.lengthOf(DATALENGTH);
            expect(games[0]).to.deep.equal(FIRST_QUIZ);
        });
    });

    it('should add a game to the database', async () => {
        gamesService.addGame(TEST_QUIZ as unknown as Game).then(() => {
            expect(QUIZ).to.be.an('array');
            expect(QUIZ).to.have.lengthOf(DATALENGTH - 1);
            expect(QUIZ[DATALENGTH + 1]).to.deep.equal(TEST_QUIZ);
        });
    });

    it('should get a game from the database based on its id', async () => {
        gamesService.getGameByID(FIRST_QUIZ.id).then((game) => {
            expect(game).to.deep.equal(FIRST_QUIZ);
        });
    });

    it('should return null if the id is not in the database', async () => {
        gamesService.getGameByID('fakeID').then((game) => {
            expect(game).to.equal(null);
        });
    });

    it('should toggle a games isHidden in the database based on its id', async () => {
        gamesService.toggleGameHidden(FIRST_QUIZ.id).then((success) => {
            expect(success).to.equal(true);
            gamesService.getGameByID(FIRST_QUIZ.id).then((game) => {
                expect(game.id).to.equal(FIRST_QUIZ.id);
                expect(game.title).to.equal(FIRST_QUIZ.title);
                expect(game.isHidden).to.not.equal(FIRST_QUIZ.isHidden);
                expect(game.lastModification).to.not.equal(FIRST_QUIZ.lastModification);
            });
        });
    });

    it('should delete a game from the database based on its id', async () => {
        gamesService.deleteGameByID(FIRST_QUIZ.id).then((success) => {
            if (success) {
                gamesService.getAllGames().then((games) => {
                    expect(games)
                        .to.be.an('array')
                        .with.lengthOf(DATALENGTH - 1);
                    expect(games[0]).to.not.deep.equal(FIRST_QUIZ);
                });
            }
        });
    });
});
