import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { ROOM_LOCKED_MESSAGE, GAME_STARTED_MESSAGE } from '@common/message';
import { PlayerAndAdminPanelComponent } from './player-and-admin-panel.component';
import SpyObj = jasmine.SpyObj;
import { of } from 'rxjs';

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
            'getChatMessages',
            'sendChatMessage',
        ]);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

        const mockChatMessage = { author: 'room', message: 'testRoom', timeStamp: new Date().toISOString() };
        socketMock.getChatMessages.and.returnValue(of(mockChatMessage));

        await TestBed.configureTestingModule({
            declarations: [PlayerAndAdminPanelComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
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

    it('Should call socket.startGame and send start game message on call to startGame, but only if there is at least one player', () => {
        component.players = [{} as Player];
        component.startGame();
        expect(socketMock.startGame).toHaveBeenCalled();
        expect(socketMock.sendChatMessage).toHaveBeenCalledWith(GAME_STARTED_MESSAGE);
        component.players = [];
        component.startGame();
        expect(socketMock.startGame).toHaveBeenCalledTimes(1);
        expect(snackBarMock.open).toHaveBeenCalledWith("Aucun joueur n'est présent dans la salle, le jeu ne peut pas commencer", 'Fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });
});
