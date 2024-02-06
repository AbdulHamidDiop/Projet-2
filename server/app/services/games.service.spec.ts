// import { Game } from '@common/game';
// import { expect } from 'chai';
// import * as fs from 'fs/promises';
// import * as sinon from 'sinon';
// import { GamesService } from './games.service';

// const QUIZ_PATH = './assets/quiz-example.json';

// describe('GamesService', () => {
//     let gamesService: GamesService;
//     let readFileStub: sinon.SinonStub;
//     let writeFileStub: sinon.SinonStub;

//     beforeEach(() => {
//         gamesService = new GamesService();
//         readFileStub = sinon.stub(fs, 'readFile');
//         writeFileStub = sinon.stub(fs, 'writeFile');
//     });

//     afterEach(() => {
//         sinon.restore();
//     });

//     it('should get all games', async () => {
//         const testData = '[{"id": "1", "title": "Game 1", "questions": []}]';
//         readFileStub.resolves(Buffer.from(testData, 'utf-8'));

//         const games: Game[] = await gamesService.getAllGames();

//         expect(games).to.be.an('array').with.lengthOf(1);
//         expect(games[0]).to.deep.equal({
//             id: '1',
//             title: 'Game 1',
//             questions: [],
//         });
//     });

//     it('should add a game', async () => {
//         const testData = '[{"id": "1", "title": "Game 1", "questions" : "[]"}]';
//         const newGame: Game = { id: '2', title: 'Game 2', questions: [] };
//         readFileStub.resolves(testData);

//         await gamesService.addGame(newGame);

//         sinon.assert.calledWith(writeFileStub, QUIZ_PATH, sinon.match(testData), 'utf8');
//     });

//     it('should get a game by ID', async () => {
//         const testData = '[{"id": "1", "title": "Game 1", "questions" : "[]"}]';
//         readFileStub.resolves(testData);

//         const game: Game = await gamesService.getGameByID('1');

//         expect(game).to.deep.equal({ id: '1', title: 'Game 1' });
//     });

//     it('should toggle game hidden status', async () => {
//         const testData = '[{"id": "1", "title": "Game 1", "questions" : "[]"}]';
//         readFileStub.resolves(testData);

//         const result: boolean = await gamesService.toggleGameHidden('1');
//         expect(result).to.equal(true);
//         sinon.assert.calledWith(writeFileStub, QUIZ_PATH, sinon.match(testData), 'utf8');
//     });

//     it('should delete a game by ID', async () => {
//         const testData = '[{"id": "1", "title": "Game 1", "questions" : "[]"}]';
//         readFileStub.resolves(testData);

//         const result: boolean = await gamesService.deleteGameByID('1');
//         expect(result).to.equal(true);
//         sinon.assert.calledWith(writeFileStub, QUIZ_PATH, sinon.match('[]'), 'utf8');
//     });
// });
