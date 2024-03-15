import { Game } from '@common/game';
import { expect } from 'chai';
import * as fs from 'fs';
import { SinonStub, stub } from 'sinon';
import { GamesService } from './games.service';

const DATA_LENGTH = 0;

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

let QUIZ = '[]';

describe('Games Service', () => {
    let gamesService: GamesService;
    let readFileStub: SinonStub;
    let writeFileStub: SinonStub;

    beforeEach(async () => {
        readFileStub = stub(fs.promises, 'readFile').resolves(QUIZ);
        writeFileStub = stub(fs.promises, 'writeFile').callsFake(async (path: fs.PathLike, data: string) => {
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
        expect(JSON.parse(QUIZ)[DATA_LENGTH]).to.deep.equal(quiz);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should modify a game from the database if that game already exists', async () => {
        await gamesService.addGame(FIRST_QUIZ as unknown as Game);
        expect(JSON.parse(QUIZ)).to.be.an('array');
        expect(JSON.parse(QUIZ)).to.have.lengthOf(1);
        expect(JSON.parse(QUIZ)[DATA_LENGTH]).to.deep.equal(FIRST_QUIZ);
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

    it('should return questions without correct answers shown', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const gameID = FIRST_QUIZ.id;
        const result = await gamesService.getQuestionsWithoutCorrectShown(gameID);
        expect(result).to.deep.equal({
            ...FIRST_QUIZ,
            questions: [
                {
                    ...FIRST_QUIZ.questions[0],
                    choices: FIRST_QUIZ.questions[0].choices.map(({ text }) => ({ text })),
                },
            ],
        });
    });

    it('should return questions without correct answers shown, including questions without choices', async () => {
        stub(gamesService, 'getGameByID').resolves(SECOND_QUIZ as unknown as Game);
        const result = await gamesService.getQuestionsWithoutCorrectShown(SECOND_QUIZ.id);
        expect(result.questions[0].choices).to.equal(undefined);
    });

    it('should determine if the answer is correct', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const result = await gamesService.isCorrectAnswer(['Angular = back-end, NodeJS = front-end'], FIRST_QUIZ.id, FIRST_QUIZ.questions[0].id);
        expect(result).to.equal(true);
    });

    it('should determine if the answer is false', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const result = await gamesService.isCorrectAnswer(['Angular = front-end, NodeJS = back-end'], FIRST_QUIZ.id, FIRST_QUIZ.questions[0].id);
        expect(result).to.equal(false);
    });

    it('should determine if the answer is correct when the game does not exist', async () => {
        const result = await gamesService.isCorrectAnswer(['Angular = front-end, NodeJS = back-end'], 'fakeID', FIRST_QUIZ.questions[0].id);
        expect(result).to.equal(false);
    });

    it('should determine if the answer is correct when there are no choices', async () => {
        stub(gamesService, 'getGameByID').resolves(SECOND_QUIZ as unknown as Game);
        const result = await gamesService.isCorrectAnswer(['Answer'], SECOND_QUIZ.id, SECOND_QUIZ.questions[0].id);
        expect(result).to.equal(true);
    });

    it('should generate feedback for submitted answers', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const gameID = FIRST_QUIZ.id;
        const questionID = FIRST_QUIZ.questions[0].id;
        const submittedAnswers = ['Angular = back-end, NodeJS = front-end'];
        const result = await gamesService.generateFeedback(gameID, questionID, submittedAnswers);
        const expectedFeedback = [
            { choice: 'Angular = front-end, NodeJS = back-end', status: undefined },
            { choice: 'Angular = back-end, NodeJS = front-end', status: 'correct' },
            { choice: 'Aucune de ces réponses', status: undefined },
        ];
        expect(result).to.deep.equal(expectedFeedback);
    });

    it('should generate feedback for submitted answers', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const gameID = FIRST_QUIZ.id;
        const questionID = FIRST_QUIZ.questions[0].id;
        const submittedAnswers = ['Angular = front-end, NodeJS = back-end'];
        const result = await gamesService.generateFeedback(gameID, questionID, submittedAnswers);
        const expectedFeedback = [
            { choice: 'Angular = front-end, NodeJS = back-end', status: 'incorrect' },
            { choice: 'Angular = back-end, NodeJS = front-end', status: 'missed' },
            { choice: 'Aucune de ces réponses', status: undefined },
        ];
        expect(result).to.deep.equal(expectedFeedback);
    });

    it('should generate feedback for submitted answers if the question do not exist', async () => {
        stub(gamesService, 'getGameByID').resolves(FIRST_QUIZ as unknown as Game);
        const gameID = FIRST_QUIZ.id;
        const questionId = 'nonexistent-question-id';
        const submittedAnswers = ['Some submitted answer'];

        try {
            await gamesService.generateFeedback(gameID, questionId, submittedAnswers);
            // If no error is thrown, fail the test
            expect.fail('Expected an error to be thrown');
        } catch (error) {
            expect(error.message).to.equal('Question not found');
        }
    });
});
