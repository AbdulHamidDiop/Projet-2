import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameService);
    });

    const mockGameId = '4d5e6f';

    // Mocked response data for the test
    const mockGame: Game = {
        id: mockGameId,
        title: 'Quiz on Web Development',
        description: 'Test your knowledge on various web development topics',
        duration: 45,
        lastModification: '2020-05-20T15:30:00+00:00',
        isHidden: false,
        questions: [
            {
                type: 'QCM',
                text: 'Which of the following is not a CSS preprocessor?',
                points: 30,
                choices: [
                    {
                        text: 'Sass',
                    },
                    {
                        text: 'LESS',
                    },
                ],
                nbChoices: 2,
            },
        ],
    } as unknown as Game;

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with an empty array of games', () => {
        expect(service.games).toEqual([]);
    });

    it('getSelectedGame should return selectedGame', () => {
        service.selectGame(mockGame);

        const selectedGame = service.getSelectedGame();

        expect(selectedGame).toEqual(mockGame);
    });

    it('selectGame should set selectedGame', () => {
        service.selectGame(mockGame);

        expect(service.getSelectedGame()).toEqual(mockGame);
    });

    it('getAllGames should fetch games from API', fakeAsync(() => {
        const mockGames: Game[] = [
            { id: '2', title: 'Game 1', questions: [], description: '', duration: 10, lastModification: null },
            { id: '3', title: 'Game 2', questions: [], description: '', duration: 10, lastModification: null },
        ];
        spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: true, json: async () => Promise.resolve(mockGames) } as Response));
        service.getAllGames().then((games) => {
            tick();
            expect(games).toEqual(mockGames);
        });
    }));

    it('should throw an error when response to getAllGames is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response),
        );
        expectAsync(service.getAllGames()).toBeRejectedWithError('Error: 500');
    }));

    it('addGame should send a POST request to API', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200, headers: { 'Content-type': 'application/json' } })));

        service.addGame(mockGame);
        tick();

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'game/importgame',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockGame),
            }),
        );
    }));

    it('should throw an error when response to addGame is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response),
        );
        expectAsync(service.addGame(mockGame)).toBeRejectedWithError('Error: 500');
    }));

    it('getGameByID should fetch game by ID from all games', fakeAsync(() => {
        const mockGames: Game[] = [
            { id: '2', title: 'Game 1', questions: [], description: '', duration: 50, lastModification: null },
            { id: '3', title: 'Game 2', questions: [], description: '', duration: 50, lastModification: null },
        ];
        service.games = mockGames;

        const foundGame = service.getGameByID('1');
        tick();

        expect(foundGame).toEqual(mockGames[0]);
    }));

    it('should throw an error when game is not found', fakeAsync(() => {
        const invalidGameId = 'invalid_id';
        const mockGames: Game[] = [
            { id: '1', title: 'Game 1', questions: [] },
            { id: '2', title: 'Game 2', questions: [] },
        ];
        spyOn(service, 'getAllGames').and.returnValue(Promise.resolve(mockGames));
        service = TestBed.inject(GameService);
        expect(() => service.getGameByID(invalidGameId)).toThrowError('Game not found');
    }));

    it('toggleGameHidden should send a PATCH request to API', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200, headers: { 'Content-type': 'application/json' } })));

        service.toggleGameHidden(mockGameId);
        tick();

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'game/togglehidden',
            jasmine.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ id: mockGameId }),
            }),
        );
    }));

    it('should throw an error when response to toggleGameHidden is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response),
        );
        expectAsync(service.toggleGameHidden('1')).toBeRejectedWithError('Error: 500');
    }));

    it('deleteGameByID should send a DELETE request to API', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' })));

        service.deleteGameByID('1');
        tick();

        expect(window.fetch).toHaveBeenCalledWith(API_URL + 'game/deletegame/1', jasmine.objectContaining({ method: 'DELETE' }));
    }));

    it('should throw an error when response to deleteGameByID is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response),
        );
        expectAsync(service.deleteGameByID('1')).toBeRejectedWithError('Error: 500');
    }));

    it('should fetch questions without correct shown for a game', async () => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                json: async () => Promise.resolve(mockGame),
            } as Response),
        );
        const result = await service.getQuestionsWithoutCorrectShown(mockGameId);
        expect(result).toEqual(mockGame);
        expect(window.fetch).toHaveBeenCalledWith(API_URL + 'game/questionswithoutcorrect/' + mockGameId);
    });

    it('should throw an error when getQuestionsWithoutCorrectShown response is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as Response),
        );
        expectAsync(service.getQuestionsWithoutCorrectShown(mockGameId)).toBeRejectedWithError('Error: 404');
    }));
    const answer = ['A', 'B', 'C'];
    const gameID = '123';
    const questionID = '456';
    it('should check answer correctly for a correct response', fakeAsync(() => {
        const mockResponse = { isCorrect: true };

        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                json: async () => Promise.resolve(mockResponse),
            } as Response),
        );

        let result: boolean | undefined;
        service.checkAnswer(answer, gameID, questionID).then((res) => (result = res));
        tick();

        expect(result).toEqual(true);
        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'game/check',
            jasmine.objectContaining({
                method: 'POST',
                headers: jasmine.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ answer, gameID, questionID }),
            }),
        );
    }));

    it('should check answer correctly for a incorrect response', fakeAsync(() => {
        const mockResponse = { isCorrect: false };

        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                json: async () => Promise.resolve(mockResponse),
            } as Response),
        );

        let result: boolean | undefined;
        service.checkAnswer(answer, gameID, questionID).then((res) => (result = res));
        tick();

        expect(result).toEqual(false);
    }));

    it('should return false if the response status to checkAnswer is not OK', fakeAsync(() => {
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response),
        );

        let result: boolean | undefined;
        service.checkAnswer(answer, gameID, questionID).then((res) => (result = res));
        tick();

        expect(result).toEqual(false);
    }));

    it('should correctly check if a game is available when it is available', fakeAsync(() => {
        const game: Game = {
            id: '123',
            title: 'Mock Game',
            questions: [],
            isHidden: false,
        };
        const mockResponse = true;

        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                json: async () => Promise.resolve(mockResponse),
            } as Response),
        );

        let result: boolean | undefined;
        service.checkHiddenOrDeleted(game).then((res) => (result = res));
        tick();

        expect(result).toEqual(true);
        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'game/availability' + game.id,
            jasmine.objectContaining({
                method: 'GET',
                headers: jasmine.objectContaining({
                    'Content-Type': 'application/json',
                }),
            }),
        );
    }));

    it('should correctly check if a game is available when it is unavailable', fakeAsync(() => {
        const hiddenGame: Game = {
            id: '123',
            title: 'Mock Game',
            questions: [],
            isHidden: true,
        };
        const mockResponse = false;

        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                json: async () => Promise.resolve(mockResponse),
            } as Response),
        );

        let result: boolean | undefined;
        service.checkHiddenOrDeleted(hiddenGame).then((res) => (result = res));
        tick();

        expect(result).toEqual(false);
    }));

    it('should throw an error when response to checkHiddenOrDeleted is not OK', fakeAsync(() => {
        const game: Game = {
            id: '123',
            title: 'Mock Game',
            questions: [],
            isHidden: false,
        };

        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response),
        );

        expectAsync(service.checkHiddenOrDeleted(game)).toBeRejectedWithError('Error: 500');
        tick();
    }));
});
