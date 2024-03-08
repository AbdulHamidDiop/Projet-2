import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { PlayerAndAdminPanelComponent } from './player-and-admin-panel.component';
import SpyObj = jasmine.SpyObj;

describe('PlayerAndAdminPanelComponent', () => {
    let component: PlayerAndAdminPanelComponent;
    let fixture: ComponentFixture<PlayerAndAdminPanelComponent>;
    let socketMock: SpyObj<SocketRoomService>;
    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['kickPlayer', 'leaveRoom', 'lockRoom', 'unlockRoom', 'startGame']);
        await TestBed.configureTestingModule({
            declarations: [PlayerAndAdminPanelComponent],
            providers: [{ provide: SocketRoomService, useValue: socketMock }],
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

    it('Should call socket.kickPlayer on call to kickPlayer', () => {
        component.kickPlayer('');
        expect(socketMock.kickPlayer).toHaveBeenCalled();
    });

    it('Should call socket.leaveRoom on call to leaveRoom', () => {
        component.leaveRoom();
        expect(socketMock.leaveRoom).toHaveBeenCalled();
    });

    it('Should call socket.lockRoom on call to lock', () => {
        component.lock();
        expect(socketMock.lockRoom).toHaveBeenCalled();
    });

    it('Should call socket.unlockRoom on call to unlock', () => {
        component.unlock();
        expect(socketMock.unlockRoom).toHaveBeenCalled();
    });

    it('Should call socket.startGame on call to startGame, but only if there is at least one player', () => {
        component.players = [{} as Player];
        component.startGame();
        expect(socketMock.startGame).toHaveBeenCalled();
        component.players = [];
        component.startGame();
        expect(socketMock.startGame).toHaveBeenCalledTimes(1);
    });
});
