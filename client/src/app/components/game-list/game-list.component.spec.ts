import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Game, GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { firstValueFrom, of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let gameService: jasmine.SpyObj<GameService>;
    let socketMock: jasmine.SpyObj<SocketRoomService>;
    let fixture: ComponentFixture<GameListComponent>;
    beforeEach(async () => {
        gameService = jasmine.createSpyObj('GameService', ['getAllGames', 'selectGame', 'getSelectedGame', 'checkHiddenOrDeleted']);
        gameService.selectGame.and.returnValue();
        socketMock = jasmine.createSpyObj('SocketRoomService', ['createRoom']);
        socketMock.createRoom.and.returnValue();
        await TestBed.configureTestingModule({
            providers: [
                { provide: GameService, useValue: gameService },
                { provide: SocketRoomService, useValue: socketMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        it('should call gameService.selectGame with the provided game', fakeAsync(() => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            component.selectGame(game);
            expect(gameService.selectGame).toHaveBeenCalledWith(game);
        }));
    });

    describe('getSelectedGame', () => {
        it('should call gameService.getSelectedGame', () => {
            component.getSelectedGame();
            expect(gameService.getSelectedGame).toBeTruthy();
        });
    });
    describe('setGameAvailability', () => {
        it('should set game as unavailable if checkHiddenOrDeleted returns false', async () => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            gameService.checkHiddenOrDeleted.and.returnValue(firstValueFrom(of(false)));
            await component.setGameAvailability(game);
            expect(game.unavailable).toBeTrue();
        });

        it('should not modify game if checkHiddenOrDeleted returns true', async () => {
            const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
            gameService.checkHiddenOrDeleted.and.returnValue(firstValueFrom(of(true)));
            await component.setGameAvailability(game);
            expect(game.unavailable).toBeUndefined();
        });
    });
});
