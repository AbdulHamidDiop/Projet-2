import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameSessionService } from '@app/services/game-session.service';
import { Game, GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { firstValueFrom, of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let gameService: jasmine.SpyObj<GameService>;
    let socketMock: jasmine.SpyObj<SocketRoomService>;
    let fixture: ComponentFixture<GameListComponent>;
    let router: jasmine.SpyObj<Router>;
    let gameSessionService: jasmine.SpyObj<GameSessionService>;

    beforeEach(async () => {
        gameService = jasmine.createSpyObj('GameService', ['getAllGames', 'selectGame', 'getSelectedGame', 'checkHiddenOrDeleted']);
        gameService.selectGame.and.returnValue();

        socketMock = jasmine.createSpyObj('SocketRoomService', ['createRoom', 'leaveRoom']);
        socketMock.createRoom.and.returnValue();

        gameSessionService = jasmine.createSpyObj('GameSessionService', ['createSession']);

        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            providers: [
                { provide: GameService, useValue: gameService },
                { provide: SocketRoomService, useValue: socketMock },
                { provide: Router, useValue: router },
                { provide: GameSessionService, useValue: gameSessionService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
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

    describe('launchGame', () => {
        it('should launch game correctly', async () => {
            spyOn(component, 'selectGame').and.returnValue(Promise.resolve());
            const game: Game = { id: '1', title: 'Test Game', unavailable: false } as Game;
            await component.launchGame(game);
            expect(component.socket.leaveRoom).toHaveBeenCalled();
            expect(component.socket.createRoom).toHaveBeenCalledWith(game);
            expect(component.router.navigate).toHaveBeenCalledWith(['/waiting']);
        });
        it('should launch test game correctly', async () => {
            spyOn(component, 'selectGame').and.returnValue(Promise.resolve());
            const game: Game = { id: '1', title: 'Test Game', unavailable: false } as Game;
            await component.launchTestGame(game);
            expect(gameSessionService.createSession).toHaveBeenCalledWith(game.id, game);
        });
    });
});
