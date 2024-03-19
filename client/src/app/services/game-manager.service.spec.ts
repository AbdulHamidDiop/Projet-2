/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';
import { GameSessionService } from '@app/services/game-session.service';
import { Feedback } from '@common/feedback';
import { Question } from '@common/game';
import { FetchService } from './fetch.service';
import { GameManagerService } from './game-manager.service';
import { Game } from './game.service';

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
    return [{ choice: 'Option 1', status: 'correct' }];
}

async function textMock(): Promise<string> {
    return '';
}

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
// const errorResponse: Response = {
//     ok: false,
//     status: 404,
//     type: 'basic',
//     headers: new Headers(),
//     redirected: false,
//     statusText: '',
//     url: '',
//     clone: () => {
//         return new Response();
//     },
//     body: new ReadableStream<Uint8Array>(),
//     bodyUsed: false,
//     arrayBuffer: arrayBufferMock,
//     blob: blobMock,
//     formData: formDataMock,
//     json: jsonMock,
//     text: textMock,
// };

// async function fetchMock(): Promise<Response> {
//     if (responseSetToOk) {
//         return response;
//     } else {
//         return errorResponse;
//     }
// }

describe('GameManagerService', () => {
    let service: GameManagerService;
    let gameSessionServiceSpy: jasmine.SpyObj<GameSessionService>;
    let fetchServiceSpy: jasmine.SpyObj<FetchService>;

    beforeEach(() => {
        const spyGameSessionService = jasmine.createSpyObj('GameSessionService', ['getQuestionsWithoutCorrectShown', 'checkAnswer']);
        const spyFetchService = jasmine.createSpyObj('FetchService', ['fetch']);
        TestBed.configureTestingModule({
            providers: [
                { provide: GameSessionService, useValue: spyGameSessionService },
                { provide: FetchService, useValue: spyFetchService },
            ],
        });
        service = TestBed.inject(GameManagerService);
        gameSessionServiceSpy = TestBed.inject(GameSessionService) as jasmine.SpyObj<GameSessionService>;
        fetchServiceSpy = TestBed.inject(FetchService) as jasmine.SpyObj<FetchService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize game data correctly', async () => {
        const mockGame = { id: 'gameId', questions: [] } as unknown as Game;
        gameSessionServiceSpy.getQuestionsWithoutCorrectShown.and.resolveTo(mockGame);
        await service.initialize('gameId');
        expect(service.game).toEqual(mockGame);
    });

    it('should reset service state', () => {
        service.currentQuestionIndex = 5;
        service.endGame = true;

        service.reset();
        expect(service.currentQuestionIndex).toBe(0);
        expect(service.endGame).toBeFalse();
    });

    it('should verify if an answer is correct', async () => {
        service.game = { id: 'gameId' } as unknown as Game;
        gameSessionServiceSpy.checkAnswer.and.resolveTo(true);
        const result = await service.isCorrectAnswer(['answer'], 'questionId');
        expect(result).toBeTrue();
    });

    it('should get feedback for a submitted answer', async () => {
        const mockFeedback = [{ choice: 'Option 1', status: 'correct' }] as unknown as Feedback[];
        service.game = { id: 'gameId' } as unknown as Game;
        fetchServiceSpy.fetch.and.resolveTo(response);
        const feedback = await service.getFeedBack('questionId', ['answer']);
        expect(feedback).toEqual(mockFeedback);
    });

    it('should return the first question', () => {
        const mockQuestions = [{ id: 'q1' }, { id: 'q2' }] as unknown as Question[];
        service.game = { id: 'gameId', questions: mockQuestions } as unknown as Game;
        const question = service.firstQuestion();
        expect(question).toEqual(mockQuestions[0]);
        expect(service.currentQuestionIndex).toBe(0);
    });

    it('should return {} as first question if it doesnt exist', () => {
        const question = service.firstQuestion();
        expect(question).toEqual({} as Question);
        expect(service.currentQuestionIndex).toBe(0);
    });

    describe('goNextQuestion', () => {
        it('should return the next question if not at the end', () => {
            const mockQuestions = [{ id: 'q1' }, { id: 'q2' }] as unknown as Question[];
            service.game = { id: 'gameId', questions: mockQuestions } as unknown as Game;
            const question = service.goNextQuestion();
            expect(question).toEqual(mockQuestions[1]);
            expect(service.currentQuestionIndex).toBe(1);
        });

        it('should return an empty Question if game is not defined', () => {
            const question = service.goNextQuestion();
            expect(question).toEqual({} as Question);
        });

        it('should mark endGame true if at the last question', () => {
            const mockQuestions = [{ id: 'q1' }];
            service.game = { id: 'gameId', questions: mockQuestions as unknown as Question[] } as unknown as Game;
            service.currentQuestionIndex = 0;

            const question = service.goNextQuestion();
            expect(service.endGame).toBeTrue();
            expect(question).toEqual(mockQuestions[0] as Question);
        });
    });
});
