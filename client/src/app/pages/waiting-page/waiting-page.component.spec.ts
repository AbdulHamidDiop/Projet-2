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
        ]);
        socketMock.roomLockedSubscribe.and.returnValue(of({} as any));
        socketMock.unlockSubscribe.and.returnValue(of({} as any));
        socketMock.leaveRoomSubscribe.and.returnValue(of({} as any));
        socketMock.roomJoinSubscribe.and.returnValue(of({} as any));
        socketMock.getGameId.and.returnValue(of(''));
        socketMock.getPlayers.and.returnValue(of([]));
        socketMock.getProfile.and.returnValue(of({ isHost: true } as Player));
        socketMock.gameStartSubscribe.and.returnValue(of({} as any, {} as any, {} as any));
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
        socketMock.roomLockedSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.unlockSubscribe).toHaveBeenCalled();
        socketMock.unlockSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.roomJoinSubscribe).toHaveBeenCalled();
        socketMock.roomJoinSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.leaveRoomSubscribe).toHaveBeenCalled();
        socketMock.leaveRoomSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.getGameId).toHaveBeenCalled();
        socketMock.getGameId().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.getPlayers).toHaveBeenCalled();
        socketMock.getPlayers().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.getProfile).toHaveBeenCalled();
        socketMock.getProfile().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.gameStartSubscribe).toHaveBeenCalled();
        socketMock.gameStartSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.kickSubscribe).toHaveBeenCalled();
        socketMock.kickSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
        expect(socketMock.disconnectSubscribe).toHaveBeenCalled();
        socketMock.disconnectSubscribe().subscribe(() => {
            expect(component).toBeTruthy();
        });
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
