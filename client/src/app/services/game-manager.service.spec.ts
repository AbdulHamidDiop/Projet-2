import { TestBed } from '@angular/core/testing';

import { Feedback } from '@common/feedback';
import { Question } from '@common/game';
import { GameManagerService } from './game-manager.service';
import { Game, GameService } from './game.service';

describe('GameManagerService', () => {
    let service: GameManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize game data correctly', async () => {
        const gameService = TestBed.inject(GameService);
        const mockGame = { id: 'gameId', questions: [] } as unknown as Game;
        spyOn(gameService, 'getQuestionsWithoutCorrectShown').and.returnValue(Promise.resolve(mockGame));

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
        const gameService = TestBed.inject(GameService);
        service.game = { id: 'gameId' } as unknown as Game;
        spyOn(gameService, 'checkAnswer').and.returnValue(Promise.resolve(true));

        const result = await service.isCorrectAnswer(['answer'], 'questionId');
        expect(result).toBeTrue();
    });

    it('should get feedback for a submitted answer', async () => {
        const mockFeedback = [{ choice: 'Option 1', status: 'correct' }] as unknown as Feedback[];
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify(mockFeedback))));

        service.game = { id: 'gameId' } as unknown as Game;
        const feedback = await service.getFeedBack('questionId', ['answer']);
        expect(feedback).toEqual(mockFeedback);
    });

    describe('nextQuestion', () => {
        it('should return the next question if not at the end', () => {
            const mockQuestions = [{ id: 'q1' }, { id: 'q2' }] as unknown as Question[];
            service.game = { id: 'gameId', questions: mockQuestions } as unknown as Game;

            const question = service.nextQuestion();
            expect(question).toEqual(mockQuestions[0]);
            expect(service.currentQuestionIndex).toBe(1);
        });

        it('should return an empty Question if game is not defined', () => {
            const question = service.nextQuestion();
            expect(question).toEqual({} as Question);
        });

        it('should mark endGame true if at the last question', () => {
            const mockQuestions = [{ id: 'q1' }];
            service.game = { id: 'gameId', questions: mockQuestions as unknown as Question[] } as unknown as Game;
            service.currentQuestionIndex = 0;

            const question = service.nextQuestion();
            expect(service.endGame).toBeTrue();
            expect(question).toEqual(mockQuestions[0] as Question);
        });
    });
});
