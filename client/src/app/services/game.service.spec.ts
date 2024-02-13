/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { API_URL } from '@common/consts';
import { Game } from '@common/game';
import { FetchService } from './fetch.service';
import { GameService } from './game.service';

const mockGameId = '4d5e6f';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockData: any = {
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

async function arrayBufferMock(): Promise<ArrayBuffer> {
    const buffer = new ArrayBuffer(0);
    return buffer;
}

async function blobMock(): Promise<Blob> {
    const blob = new Blob();
    return blob;
}

async function formDataMock(): Promise<FormData> {
    const formData = new FormData();
    return formData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonMock(): Promise<any> {
    return mockData;
}

async function textMock(): Promise<string> {
    return '';
}

let responseSetToOk = true;
const response: Response = {
    ok: true,
    status: 200,
    headers: new Headers(),
    type: 'basic',
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};
const errorResponse: Response = {
    ok: false,
    status: 404,
    type: 'basic',
    headers: new Headers(),
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};

async function fetchMock(): Promise<Response> {
    if (responseSetToOk) {
        return response;
    } else {
        return errorResponse;
    }
}
describe('GameService', () => {
    let service: GameService;
    beforeEach(() => {
        mockData = {
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

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: FetchService,
                    useValue: {
                        fetch: jasmine.createSpy().and.callFake(fetchMock),
                    },
                },
            ],
        });
        service = TestBed.inject(GameService);
    });

    afterEach(() => {
        responseSetToOk = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with an empty array of games', () => {
        expect(service.games).toEqual([]);
    });

    it('getSelectedGame should return selectedGame', () => {
        service.selectGame(mockData);

        const selectedGame = service.getSelectedGame();

        expect(selectedGame).toEqual(mockData);
    });

    it('selectGame should set selectedGame', () => {
        service.selectGame(mockData);

        expect(service.getSelectedGame()).toEqual(mockData);
    });

    it('getAllGames should fetch games from API', fakeAsync(() => {
        mockData = [
            { id: '2', title: 'Game 1', questions: [], description: '', duration: 10, lastModification: null },
            { id: '3', title: 'Game 2', questions: [], description: '', duration: 10, lastModification: null },
        ];
        service.getAllGames().then((games) => {
            tick();
            expect(games).toEqual(mockData);
        });
    }));

    it('should throw an error when response to getAllGames is not OK', fakeAsync(() => {
        responseSetToOk = false;
        expectAsync(service.getAllGames()).toBeRejectedWithError('Error: 404');
    }));

    it('addGame should send a POST request to API', fakeAsync(() => {
        service.addGame(mockData);
        tick();

        expect(service.fetchService.fetch).toHaveBeenCalledWith(
            API_URL + 'game/importgame',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockData),
            }),
        );
    }));

    it('should throw an error when response to addGame is not OK', fakeAsync(() => {
        responseSetToOk = false;
        expectAsync(service.addGame(mockData)).toBeRejectedWithError('Error: 404');
    }));

    it('getGameByID should fetch game by ID from all games', fakeAsync(() => {
        const mockGames: Game[] = [
            { id: '2', title: 'Game 1', questions: [], description: '', duration: 50, lastModification: null },
            { id: '3', title: 'Game 2', questions: [], description: '', duration: 50, lastModification: null },
        ];
        service.games = mockGames;

        const foundGame = service.getGameByID('2');
        tick();

        expect(foundGame).toEqual(mockGames[0]);
    }));

    it('should throw an error when game is not found', fakeAsync(() => {
        const invalidGameId = 'invalid_id';
        service = TestBed.inject(GameService);
        expect(() => service.getGameByID(invalidGameId)).toThrowError('Game not found');
    }));

    it('toggleGameHidden should send a PATCH request to API', fakeAsync(() => {
        service.toggleGameHidden(mockGameId);
        tick();

        expect(service.fetchService.fetch).toHaveBeenCalledWith(
            API_URL + 'game/togglehidden',
            jasmine.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ id: mockGameId }),
            }),
        );
    }));

    it('should throw an error when response to toggleGameHidden is not OK', fakeAsync(() => {
        responseSetToOk = false;
        expectAsync(service.toggleGameHidden('1')).toBeRejectedWithError('Error: 404');
    }));

    it('deleteGameByID should send a DELETE request to API', fakeAsync(() => {

        service.deleteGameByID('1');
        tick();

        expect(service.fetchService.fetch).toHaveBeenCalledWith(API_URL + 'game/delete/1', jasmine.objectContaining({ method: 'DELETE' }));
    }));

    it('should throw an error when response to deleteGameByID is not OK', fakeAsync(() => {
        responseSetToOk = false;
        expectAsync(service.deleteGameByID('1')).toBeRejectedWithError('Error: 404');
    }));

    it('should fetch questions without correct shown for a game', async () => {
        const result = await service.getQuestionsWithoutCorrectShown(mockGameId);
        expect(result).toEqual(mockData);
        expect(service.fetchService.fetch).toHaveBeenCalledWith(API_URL + 'game/questionswithoutcorrect/' + mockGameId);
    });

    it('should throw an error when getQuestionsWithoutCorrectShown response is not OK', fakeAsync(() => {
        responseSetToOk = false;
        expectAsync(service.getQuestionsWithoutCorrectShown(mockGameId)).toBeRejectedWithError('Error: 404');
    }));

    const answer = ['A', 'B', 'C'];
    const gameID = '123';
    const questionID = '456';
    it('should check answer correctly for a correct response', fakeAsync(() => {
        mockData = { isCorrect: true };
        let result: boolean | undefined;
        service.checkAnswer(answer, gameID, questionID).then((res) => (result = res));
        tick();

        expect(result).toEqual(true);
        expect(service.fetchService.fetch).toHaveBeenCalledWith(
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
        mockData = { isCorrect: false };
        let result: boolean | undefined;
        service.checkAnswer(answer, gameID, questionID).then((res) => (result = res));
        tick();

        expect(result).toEqual(false);
    }));

    it('should return false if the response status to checkAnswer is not OK', fakeAsync(() => {
        responseSetToOk = false;
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
        mockData = true;
        let result: boolean | undefined;
        service.checkHiddenOrDeleted(game).then((res) => (result = res));
        tick();

        expect(result).toEqual(true);
        expect(service.fetchService.fetch).toHaveBeenCalledWith(
            API_URL + 'game/availability/' + game.id,
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
        mockData = false;
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
        responseSetToOk = false;
        expectAsync(service.checkHiddenOrDeleted(game)).toBeRejectedWithError('Error: 404');
        tick();
    }));
});
