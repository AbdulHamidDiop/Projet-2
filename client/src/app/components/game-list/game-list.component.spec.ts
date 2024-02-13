import { TestBed } from '@angular/core/testing';
import { Game, GameService } from '@app/services/game.service';
import { firstValueFrom, of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let gameService: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        const gameServiceSpy = jasmine.createSpyObj('GameService', ['getAllGames', 'selectGame', 'getSelectedGame', 'checkHiddenOrDeleted']);

        await TestBed.configureTestingModule({
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();

        gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    });

    beforeEach(() => {
        component = new GameListComponent(gameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should fetch all games and filter hidden ones', async () => {
            const games: Game[] = [
                { id: '1', title: 'Game 1', isHidden: false, questions: [] },
                { id: '2', title: 'Game 2', isHidden: true, questions: [] },
            ];

            gameService.getAllGames.and.returnValue(Promise.resolve(games));

            await component.ngOnInit();

            expect(component.games).toEqual([games[0]]);
        });
    });

    describe('selectGame', () => {
        it('should call gameService.selectGame with the provided game', async () => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            await component.selectGame(game);
            expect(gameService.selectGame).toHaveBeenCalledWith(game);
        });
    });

    describe('getSelectedGame', () => {
        it('should call gameService.getSelectedGame', () => {
            component.getSelectedGame();
            expect(gameService.getSelectedGame).toBeTruthy();
        });
    });
    describe('checkAvailable', () => {
        it('should set game as unavailable if checkHiddenOrDeleted returns false', async () => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            gameService.checkHiddenOrDeleted.and.returnValue(firstValueFrom(of(false)));
            await component.checkAvailable(game);
            expect(game.unavailable).toBeTrue();
        });

        it('should not modify game if checkHiddenOrDeleted returns true', async () => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            gameService.checkHiddenOrDeleted.and.returnValue(firstValueFrom(of(true)));
            await component.checkAvailable(game);
            expect(game.unavailable).toBeUndefined();
        });
    });
});
