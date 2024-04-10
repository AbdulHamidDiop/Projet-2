import { TestBed } from '@angular/core/testing';
import { FetchService } from '@app/services/fetch.service';
import { StatusCodes } from 'http-status-codes';
import { environment } from 'src/environments/environment';
import { GameSessionService } from './game-session.service';
import { Game } from './game.service';

const SESSION: GameSession = {
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
    isCompleted: false,
} as unknown as GameSession;

describe('GameSessionService', () => {
    let service: GameSessionService;
    let fetchService: jasmine.SpyObj<FetchService>;

    beforeEach(() => {
        const fetchSpy = jasmine.createSpyObj('FetchService', ['fetch']);

        TestBed.configureTestingModule({
            providers: [GameSessionService, { provide: FetchService, useValue: fetchSpy }],
        });

        service = TestBed.inject(GameSessionService);
        fetchService = TestBed.inject(FetchService) as jasmine.SpyObj<FetchService>;
    });

    it('should fetch questions without correct shown', async () => {
        const pin = '1234';
        const responseData: Game = {} as Game;
        const mockResponse: Response = { ok: true, json: async () => Promise.resolve(responseData) } as Response;
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/questionswithoutcorrect/' + pin)
            .and.returnValue(Promise.resolve(mockResponse));
        const result = await service.getGameWithoutCorrectShown(pin);
        expect(result).toEqual(responseData);
        expect(fetchService.fetch).toHaveBeenCalledWith(environment.serverUrl + 'gameSession/questionswithoutcorrect/' + pin);
    });

    it('should handle when response is not ok', async () => {
        const pin = '1234';
        const mockResponse: Response = { ok: false, status: StatusCodes.NOT_FOUND } as Response;
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/questionswithoutcorrect/' + pin)
            .and.returnValue(Promise.resolve(mockResponse));
        await expectAsync(service.getGameWithoutCorrectShown(pin)).toBeRejectedWithError(`Error: ${mockResponse.status}`);
    });

    it('should call checkAnswer and return true if answer is correct', async () => {
        // Mock data
        const answer = ['A', 'B'];
        const sessionPin = '1234';
        const questionID = '5678';
        const responseData = { isCorrect: true };
        const mockResponse: Promise<Response> = {
            ok: true,
            json: async () => Promise.resolve(responseData),
        } as unknown as Promise<Response>;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/check', {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, sessionPin, questionID }),
            })
            .and.returnValue(Promise.resolve(mockResponse));
        const result = await service.checkAnswer(answer, sessionPin, questionID);
        expect(result).toBeTrue();
    });

    it('should call checkAnswer and return false if answer is incorrect', async () => {
        // Mock data
        const answer = ['A', 'B'];
        const sessionPin = '1234';
        const questionID = '5678';
        const responseData = { isCorrect: false };
        const mockResponse: Promise<Response> = {
            ok: true,
            json: async () => Promise.resolve(responseData),
        } as unknown as Promise<Response>;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/check', {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, sessionPin, questionID }),
            })
            .and.returnValue(Promise.resolve(mockResponse));

        const result = await service.checkAnswer(answer, sessionPin, questionID);
        expect(result).toBeFalse();
    });

    it('should return false if an error occurs during fetch', async () => {
        // Mock data
        const answer = ['A', 'B'];
        const sessionPin = '1234';
        const questionID = '5678';
        const mockResponse: Promise<Response> = {
            ok: false,
            status: 500,
        } as unknown as Promise<Response>;
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/check', {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, sessionPin, questionID }),
            })
            .and.returnValue(Promise.resolve(mockResponse));
        const result = await service.checkAnswer(answer, sessionPin, questionID);
        expect(result).toBeFalse();
    });

    it('should create session successfully', async () => {
        const pin = '1234';
        const game = { id: '5678', title: 'Test Game', questions: [], isHidden: false };
        const mockResponse: Promise<Response> = { ok: true } as unknown as Promise<Response>;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/create/' + pin, {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(game),
            })
            .and.returnValue(Promise.resolve(mockResponse));
        await expectAsync(service.createSession(pin, game)).toBeResolved();
    });

    it('should throw error when session creation fails', async () => {
        // Mock data
        const pin = '1234';
        const game = { id: '5678', title: 'Test Game', questions: [], isHidden: false };
        const mockResponse: Promise<Response> = { ok: false, status: 500 } as unknown as Promise<Response>;

        // Set up mock response from FetchService to simulate failure
        fetchService.fetch
            .withArgs(environment.serverUrl + 'gameSession/create/' + pin, {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(game),
            })
            .and.returnValue(Promise.resolve(mockResponse));

        // Call the method and expect it to throw an error
        await expectAsync(service.createSession(pin, game)).toBeRejectedWithError('Error: 500');
    });

    it('should create session successfully', async () => {
        const pin = '1234';
        const game = { id: '5678', title: 'Test Game', questions: [], isHidden: false };
        const mockResponse: Promise<Response> = { ok: true } as unknown as Promise<Response>;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/create/' + pin, {
                method: 'POST',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(game),
            })
            .and.returnValue(Promise.resolve(mockResponse));
        await expectAsync(service.createSession(pin, game)).toBeResolved();
    });

    it('should return sessions successfully', async () => {
        const mockSessions: GameSession[] = [SESSION];

        const mockResponse: Response = {
            ok: true,
            json: async () => mockSessions,
        } as unknown as Response;

        fetchService.fetch.and.returnValue(Promise.resolve(mockResponse));

        await expectAsync(service.getAllSessions()).toBeResolvedTo(mockSessions);
    });

    it('should throw an error if response is not ok', async () => {
        const mockErrorResponse: Response = { ok: false, status: 404 } as unknown as Response;
        fetchService.fetch.and.returnValue(Promise.resolve(mockErrorResponse));

        await expectAsync(service.getAllSessions()).toBeRejectedWithError('Error: 404');
    });

    it('should complete session successfully', async () => {
        const pin = '1234';
        const bestScore = 10;
        const mockResponse: Response = { ok: true } as unknown as Response;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/completeSession', {
                method: 'PATCH',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, bestScore }),
            })
            .and.returnValue(Promise.resolve(mockResponse));

        await expectAsync(service.completeSession(pin, bestScore)).toBeResolved();
    });

    it('should throw error when session completion fails', async () => {
        const pin = '1234';
        const bestScore = 10;
        const mockErrorResponse: Response = { ok: false, status: 500 } as unknown as Response;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/completeSession', {
                method: 'PATCH',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, bestScore }),
            })
            .and.returnValue(Promise.resolve(mockErrorResponse));

        await expectAsync(service.completeSession(pin, bestScore)).toBeRejectedWithError('Error: 500');
    });

    it('should delete history successfully', async () => {
        const mockResponse: Response = { ok: true } as unknown as Response;
        fetchService.fetch.and.returnValue(Promise.resolve(mockResponse));

        await expectAsync(service.deleteHistory()).toBeResolved();
    });

    it('should throw an error if response is not ok', async () => {
        const mockErrorResponse: Response = { ok: false, status: 404 } as unknown as Response;
        fetchService.fetch.and.returnValue(Promise.resolve(mockErrorResponse));

        await expectAsync(service.deleteHistory()).toBeRejectedWithError('Error: 404');
    });

    it('should add number of players successfully', async () => {
        const pin = '1234';
        const nbPlayers = 10;
        const mockResponse: Response = { ok: true } as unknown as Response;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/addNbPlayers', {
                method: 'PATCH',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nbPlayers, pin }),
            })
            .and.returnValue(Promise.resolve(mockResponse));

        await expectAsync(service.addNbPlayers(nbPlayers, pin)).toBeResolved();
    });

    it('should throw error when adding number of players fails', async () => {
        const pin = '1234';
        const nbPlayers = 10;
        const mockErrorResponse: Response = { ok: false, status: 500 } as unknown as Response;

        // Set up mock response from FetchService
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/addNbPlayers', {
                method: 'PATCH',
                // Le test ne fonctionne pas sinon
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nbPlayers, pin }),
            })
            .and.returnValue(Promise.resolve(mockErrorResponse));

        await expectAsync(service.addNbPlayers(nbPlayers, pin)).toBeRejectedWithError('Error: 500');
    });
});
