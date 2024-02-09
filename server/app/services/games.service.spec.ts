import { Game } from '@common/game';
import { expect } from 'chai';
import * as fs from 'fs';
import sinon from 'sinon';
import { GamesService } from './games.service';

const DATALENGTH = 0;

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

let QUIZ = '[]';

describe('Games Service', () => {
    let gamesService: GamesService;
    let readFileStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;

    beforeEach(async () => {
        readFileStub = sinon.stub(fs.promises, 'readFile').resolves(QUIZ);
        writeFileStub = sinon.stub(fs.promises, 'writeFile').callsFake(async (path: fs.PathLike, data: string) => {
            return new Promise<void>((resolve) => {
                QUIZ = data;
                resolve();
            });
        });

        gamesService = new GamesService();
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    it('should add a game to the database', async () => {
        const quiz = { ...FIRST_QUIZ, title: 'Title' } as unknown as Game;
        await gamesService.addGame(quiz);
        expect(JSON.parse(QUIZ)).to.be.an('array');
        expect(JSON.parse(QUIZ)).to.have.lengthOf(1);
        expect(JSON.parse(QUIZ)[DATALENGTH]).to.deep.equal(quiz);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should modify a game from the database if that game already exists', async () => {
        await gamesService.addGame(FIRST_QUIZ as unknown as Game);
        expect(JSON.parse(QUIZ)).to.be.an('array');
        expect(JSON.parse(QUIZ)).to.have.lengthOf(1);
        expect(JSON.parse(QUIZ)[DATALENGTH]).to.deep.equal(FIRST_QUIZ);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should get all games', async () => {
        const games = await gamesService.getAllGames();
        expect(games).to.be.an('array').with.lengthOf(1);
        expect(games[0]).to.deep.equal(FIRST_QUIZ);
        expect(readFileStub.called);
    });

    it('should get a game from the database based on its id', async () => {
        const game = await gamesService.getGameByID(FIRST_QUIZ.id);
        expect(game).to.deep.equal(FIRST_QUIZ);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should return null if the id is not in the database', async () => {
        const game = await gamesService.getGameByID('fakeID');
        expect(game).to.equal(null);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should not toggle any game if the id is not in the list', async () => {
        const success = await gamesService.toggleGameHidden('fakeID');
        expect(success).to.equal(false);
        expect(JSON.parse(QUIZ)).to.deep.equal([FIRST_QUIZ]);
        expect(readFileStub.called);
        expect(writeFileStub.notCalled);
    });

    it('should toggle a games isHidden in the database based on its id', async () => {
        const success = await gamesService.toggleGameHidden(FIRST_QUIZ.id);
        expect(success).to.equal(true);
        expect(JSON.parse(QUIZ)[0].id).to.equal(FIRST_QUIZ.id);
        expect(JSON.parse(QUIZ)[0].title).to.equal(FIRST_QUIZ.title);
        expect(JSON.parse(QUIZ)[0].isHidden).to.not.equal(FIRST_QUIZ.isHidden);
        expect(JSON.parse(QUIZ)[0].lastModification).to.not.equal(FIRST_QUIZ.lastModification);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should delete a game from the database based on its id', async () => {
        await gamesService.deleteGameByID('FakeID');
        expect(JSON.parse(QUIZ)).to.be.an('array');
        expect(JSON.parse(QUIZ)).to.have.lengthOf(1);
        expect(readFileStub.called);
        expect(writeFileStub.notCalled);
    });

    it('should delete a game from the database based on its id', async () => {
        await gamesService.deleteGameByID(FIRST_QUIZ.id);
        expect(JSON.parse(QUIZ)).to.be.an('array');
        expect(JSON.parse(QUIZ)).to.have.lengthOf(0);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });
});
