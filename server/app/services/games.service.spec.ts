import { Game } from '@common/game';
import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import { GamesService } from './games.service';
const gamePath = './assets/test-data/quizs.json';
const testDataLength = 11;
const firstGame = {
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
};

const testGame = {
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
} as unknown as Game;
describe('Games Service', () => {
    let gamesService: GamesService;
    let readFileStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;

    beforeEach(async () => {
        gamesService = new GamesService();
        readFileStub = sinon.stub(fs, 'readFile').callsFake((path, callback) => {
            // Simulate reading data from a file
            fs.readFile(gamePath, 'utf8', callback);
        });
        writeFileStub = sinon.stub(fs, 'writeFile').callsFake((path, data, callback) => {
            // Simulate writing data to a file
            fs.writeFile(gamePath, JSON.stringify(data, null, 2), 'utf8', callback);
        });
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    it('should get all games', async () => {
        gamesService.getAllGames().then((games) => {
            expect(games).to.be.an('array').with.lengthOf(testDataLength);
            expect(games[0]).to.deep.equal(firstGame);
        });
    });

    it('should add a game to the database', async () => {
        gamesService.addGame(testGame).then(() => {
            gamesService.getAllGames().then((games) => {
                expect(games)
                    .to.be.an('array')
                    .with.lengthOf(testDataLength + 1);
                expect(games[testDataLength + 1]).to.deep.equal(testGame);
            });
        });
    });

    it('should get a game from the database based on its id', async () => {
        gamesService.getGameByID(firstGame.id).then((game) => {
            expect(game).to.deep.equal(firstGame);
        });
    });

    it('should return null if the id is not in the database', async () => {
        gamesService.getGameByID('fakeID').then((game) => {
            expect(game).to.equal(null);
        });
    });

    it('should toggle a games isHidden in the database based on its id', async () => {
        gamesService.toggleGameHidden(firstGame.id).then((success) => {
            expect(success).to.equal(true);
            gamesService.getGameByID(firstGame.id).then((game) => {
                expect(game.id).to.equal(firstGame.id);
                expect(game.title).to.equal(firstGame.title);
                expect(game.isHidden).to.not.equal(firstGame.isHidden);
                expect(game.lastModification).to.not.equal(firstGame.lastModification);
            });
        });
    });

    it('should delete a game from the database based on its id', async () => {
        gamesService.deleteGameByID(firstGame.id).then((success) => {
            if (success) {
                gamesService.getAllGames().then((games) => {
                    expect(games)
                        .to.be.an('array')
                        .with.lengthOf(testDataLength - 1);
                    expect(games[0]).to.not.deep.equal(firstGame);
                });
            }
        });
    });
});
