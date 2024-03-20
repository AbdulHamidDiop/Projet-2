import { TestBed } from '@angular/core/testing';
import { FetchService } from '@app/services/fetch.service';
import { API_URL } from '@common/consts';
import { StatusCodes } from 'http-status-codes';
import { GameSessionService } from './game-session.service';
import { Game } from './game.service';

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
        fetchService.fetch.withArgs(API_URL + 'gameSession/questionswithoutcorrect/' + pin).and.returnValue(Promise.resolve(mockResponse));
        const result = await service.getQuestionsWithoutCorrectShown(pin);
        expect(result).toEqual(responseData);
        expect(fetchService.fetch).toHaveBeenCalledWith(API_URL + 'gameSession/questionswithoutcorrect/' + pin);
    });

    it('should handle when response is not ok', async () => {
        const pin = '1234';
        const mockResponse: Response = { ok: false, status: StatusCodes.NOT_FOUND } as Response;
        fetchService.fetch.withArgs(API_URL + 'gameSession/questionswithoutcorrect/' + pin).and.returnValue(Promise.resolve(mockResponse));
        await expectAsync(service.getQuestionsWithoutCorrectShown(pin)).toBeRejectedWithError(`Error: ${mockResponse.status}`);
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
            .withArgs(API_URL + 'gameSession/check', {
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
            .withArgs(API_URL + 'gameSession/check', {
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
            .withArgs(API_URL + 'gameSession/check', {
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

    it('should throw error when session creation fails', async () => {
        // Mock data
        const pin = '1234';
        const game = { id: '5678', title: 'Test Game', questions: [], isHidden: false };
        const mockResponse: Promise<Response> = { ok: false, status: 500 } as unknown as Promise<Response>;

        // Set up mock response from FetchService to simulate failure
        fetchService.fetch
            .withArgs(API_URL + 'gameSession/create/' + pin, {
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
});
