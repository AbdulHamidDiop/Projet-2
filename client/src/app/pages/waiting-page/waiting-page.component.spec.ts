import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Player } from '@common/game';
import { of } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';
import SpyObj = jasmine.SpyObj;

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let socketMock: SpyObj<SocketRoomService>;
    let routerMock: SpyObj<Router>;
    let gameServiceMock: SpyObj<GameService>;
    let snackBarMock: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', [
            'roomLockedSubscribe',
            'leaveRoomSubscribe',
            'roomJoinSubscribe',
            'getGameId',
            'getPlayers',
            'getProfile',
            'gameStartSubscribe',
            'kickSubscribe',
            'disconnectSubscribe',
            'leaveRoom',
            'sendMessage',
            'requestPlayers',
        ]);
        socketMock.leaveRoomSubscribe.and.returnValue(of(undefined));
        socketMock.roomJoinSubscribe.and.returnValue(of(true));
        socketMock.getGameId.and.returnValue(of('123'));
        socketMock.getPlayers.and.returnValue(of([]));
        socketMock.getProfile.and.returnValue(of({ isHost: true } as Player));
        socketMock.gameStartSubscribe.and.returnValue(of(undefined));
        socketMock.disconnectSubscribe.and.returnValue(of(undefined));
        socketMock.roomLockedSubscribe.and.returnValue(of(true));
        socketMock.kickSubscribe.and.returnValue(of('Reason for kick'));

        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        gameServiceMock = jasmine.createSpyObj('GameService', ['getGameByID']);
        gameServiceMock.getGameByID.and.returnValue({ id: '123' } as Game);

        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            declarations: [WaitingPageComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: Router, useValue: routerMock },
                { provide: GameService, useValue: gameServiceMock },
                { provide: MatSnackBar, useValue: snackBarMock },
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
        expect(socketMock.roomJoinSubscribe).toHaveBeenCalled();
        expect(socketMock.leaveRoomSubscribe).toHaveBeenCalled();
        expect(socketMock.getGameId).toHaveBeenCalled();
        expect(socketMock.getPlayers).toHaveBeenCalled();
        expect(socketMock.getProfile).toHaveBeenCalled();
        expect(socketMock.gameStartSubscribe).toHaveBeenCalled();
        expect(socketMock.kickSubscribe).toHaveBeenCalled();
        expect(socketMock.disconnectSubscribe).toHaveBeenCalled();
    });

    it('Should show a snack bar message and return early if roomJoinSubscribe emits false', () => {
        socketMock.roomJoinSubscribe.and.returnValue(of(false));
        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(snackBarMock.open).toHaveBeenCalledWith("Cette partie n'existe pas", 'Fermer', { verticalPosition: 'top', duration: 5000 });
    });

    it('Should navigate to hostView if player is the host', fakeAsync(() => {
        const fiveSeconds = 50000;
        const threeSeconds = 3000;
        component.player.isHost = true;
        component.gameStartSubscribe();

        socketMock.requestPlayers.and.returnValue();
        tick(fiveSeconds + 1);
        tick(threeSeconds + 1);

        expect(routerMock.navigate).toHaveBeenCalledWith(['/hostView/123']);
    }));

    it('Should navigate to game if player is not the host', fakeAsync(() => {
        const fiveSeconds = 50000;
        component.player.isHost = false;
        component.gameStartSubscribe();

        tick(fiveSeconds + 1);

        expect(routerMock.navigate).toHaveBeenCalledWith(['/game/123']);
    }));
});
