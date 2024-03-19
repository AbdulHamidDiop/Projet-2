/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { ChatMessage } from '@common/message';
import { of } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';
import SpyObj = jasmine.SpyObj;

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let socketMock: SpyObj<SocketRoomService>;
    let routerMock: SpyObj<Router>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', [
            'roomLockedSubscribe',
            'unlockSubscribe',
            'leaveRoomSubscribe',
            'roomJoinSubscribe',
            'getGameId',
            'getPlayers',
            'getProfile',
            'gameStartSubscribe',
            'kickSubscribe',
            'disconnectSubscribe',
            'leaveRoom',
            'getChatMessages',
            'sendMessage',
            'listenForMessages',
        ]);
        socketMock.roomLockedSubscribe.and.returnValue(of({} as any));
        socketMock.unlockSubscribe.and.returnValue(of({} as any));
        socketMock.leaveRoomSubscribe.and.returnValue(of({} as any));
        socketMock.roomJoinSubscribe.and.returnValue(of({} as any));
        socketMock.getGameId.and.returnValue(of(''));
        socketMock.getPlayers.and.returnValue(of([]));
        socketMock.getProfile.and.returnValue(of({ isHost: true } as Player));
        socketMock.gameStartSubscribe.and.returnValue(of({} as any));
        socketMock.kickSubscribe.and.returnValue(of({} as any));
        socketMock.disconnectSubscribe.and.returnValue(of({} as any));
        socketMock.getChatMessages.and.returnValue(of({} as ChatMessage));

        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [WaitingPageComponent, SidebarComponent, PlayAreaComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should subscribe to several events on call to constructor', () => {
        expect(socketMock.roomLockedSubscribe).toHaveBeenCalled();
        expect(socketMock.unlockSubscribe).toHaveBeenCalled();
        expect(socketMock.roomJoinSubscribe).toHaveBeenCalled();
        expect(socketMock.leaveRoomSubscribe).toHaveBeenCalled();
        expect(socketMock.getGameId).toHaveBeenCalled();
        expect(socketMock.getPlayers).toHaveBeenCalled();
        expect(socketMock.getProfile).toHaveBeenCalled();
        expect(socketMock.gameStartSubscribe).toHaveBeenCalled();
        expect(socketMock.kickSubscribe).toHaveBeenCalled();
        expect(socketMock.disconnectSubscribe).toHaveBeenCalled();
    });

    it('Should send to different router links depending on player.isHost', () => {
        component.player = { isHost: true } as Player;
        component.gameStartSubscribe();
        socketMock.gameStartSubscribe().subscribe(() => {
            expect(routerMock.navigate).toHaveBeenCalled();
        });
        component.player = { isHost: false } as Player;
        component.gameStartSubscribe();
        socketMock.gameStartSubscribe().subscribe(() => {
            expect(routerMock.navigate).toHaveBeenCalled();
        });
    });

    it('Should call socket.leaveRoom on call to ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(socketMock.leaveRoom).toHaveBeenCalled();
    });
});
