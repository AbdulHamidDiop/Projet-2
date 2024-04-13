import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';
import { ROOM_LOCKED_MESSAGE } from '@common/message';
import { of } from 'rxjs';
import { PlayerAndAdminPanelComponent } from './player-and-admin-panel.component';
import SpyObj = jasmine.SpyObj;

describe('PlayerAndAdminPanelComponent', () => {
    let component: PlayerAndAdminPanelComponent;
    let fixture: ComponentFixture<PlayerAndAdminPanelComponent>;
    let socketMock: SpyObj<SocketRoomService>;
    let snackBarMock: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', [
            'kickPlayer',
            'leaveRoom',
            'lockRoom',
            'unlockRoom',
            'startGame',
            'startRandomGame',
            'getChatMessages',
            'sendChatMessage',
            'endGame',
            'listenForMessages',
        ]);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

        const mockChatMessage = { author: 'room', message: 'testRoom', timeStamp: new Date().toISOString() };
        socketMock.getChatMessages.and.returnValue(of(mockChatMessage));
        socketMock.endGame.and.returnValue();
        socketMock.listenForMessages.and.returnValue(of({}));

        await TestBed.configureTestingModule({
            declarations: [PlayerAndAdminPanelComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerAndAdminPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should update room variable on chat message subscription', () => {
        expect(component.room).toEqual('testRoom');
    });

    it('Should call socket.kickPlayer on call to kickPlayer', () => {
        component.kickPlayer('');
        expect(socketMock.kickPlayer).toHaveBeenCalled();
    });

    it('Should call socket.leaveRoom on call to leaveRoom', () => {
        component.leaveRoom();
        expect(socketMock.leaveRoom).toHaveBeenCalled();
    });

    it('Should call socket.lockRoom and send lock message on call to lock', () => {
        component.lock();
        expect(socketMock.lockRoom).toHaveBeenCalled();
        expect(socketMock.sendChatMessage).toHaveBeenCalledWith(ROOM_LOCKED_MESSAGE);
    });

    it('Should call socket.unlockRoom and send unlock message on call to unlock', () => {
        component.roomLocked = true;
        component.unlock();
        expect(socketMock.unlockRoom).toHaveBeenCalled();
        expect(socketMock.sendChatMessage).toHaveBeenCalledWith(
            jasmine.objectContaining({
                author: 'Système',
                message: 'La salle est maintenant déverrouillée',
            }),
        );
    });

    it('Should send game start message when starting a game with a locked room and at least one player', () => {
        component.players = [{} as Player];
        component.roomLocked = true;
        const expectedMessage = jasmine.objectContaining({
            author: 'Système',
            message: 'Le jeu commence',
        });
        component.startGame();
        expect(socketMock.startGame).toHaveBeenCalled();
        expect(socketMock.sendChatMessage).toHaveBeenCalledWith(expectedMessage);
    });

    it('Should send game start message when starting a random game with a locked room and at least one player', () => {
        component.inRandomMode = true;
        component.players = [{} as Player];
        component.roomLocked = true;
        const expectedMessage = jasmine.objectContaining({
            author: 'Système',
            message: 'Le jeu commence',
        });
        component.startGame();
        expect(socketMock.startRandomGame).toHaveBeenCalled();
        expect(socketMock.sendChatMessage).toHaveBeenCalledWith(expectedMessage);
    });

    it('Should show a snackbar if trying to start a game with an unlocked room', () => {
        component.players = [{} as Player];
        component.roomLocked = false;
        component.startGame();
        expect(snackBarMock.open).toHaveBeenCalledWith('La partie doit être verrouillée avant de commencer', 'Fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });

    it('Should show a snackbar if trying to start a game with no players', () => {
        component.players = [];
        component.roomLocked = true;
        component.startGame();
        expect(socketMock.startGame).not.toHaveBeenCalled();
        expect(snackBarMock.open).toHaveBeenCalledWith("Aucun joueur n'est présent dans la salle, le jeu ne peut pas commencer", 'Fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });

    it('Should set inRandomMode correctly on initializeGame', () => {
        const game = { id: '12345678-aleatoire' } as Game;
        component.initializeGame(game);
        expect(component.game).toEqual(game);
        expect(component.inRandomMode).toBeTruthy();
    });
});
