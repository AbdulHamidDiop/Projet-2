import { TestBed } from '@angular/core/testing';

import { SocketRoomService } from './socket-room.service';

describe('SocketRoomService', () => {
    let service: SocketRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should have a joinRoom method', () => {
        service.joinRoom();
        expect(service.joinRoom).toBeTruthy();
    });

    it('Should have a getPlayers method', () => {
        service.getPlayers().subscribe((players) => {
            expect(players).toBeTruthy();
        });
        expect(service.getPlayers).toBeTruthy();
    });

    it('Should have a sendMessage method', () => {
        service.sendMessage('');
        expect(service.sendMessage).toBeTruthy();
    });

    it('Should have a leaveRoom method', () => {
        service.leaveRoom();
        expect(service.leaveRoom).toBeTruthy();
    });

    it('Should have a joinRoom method', () => {
        service.joinRoom();
        expect(service.joinRoom).toBeTruthy();
    });

    it('Should have an onMessage method', () => {
        service.onMessage().subscribe((message) => {
            expect(message).toBeTruthy();
        });
        expect(service.onMessage).toBeTruthy();
    });

    it('Should have a sendMessage method', () => {
        service.sendMessage('');
        expect(service.sendMessage).toBeTruthy();
    });

    it('Should have a disconnect method', () => {
        service.disconnect();
        expect(service.disconnect).toBeTruthy();
    });

    it('Should have a lockRoom method', () => {
        service.lockRoom().subscribe((response) => {
            expect(response).toBeTruthy();
        });
        expect(service.lockRoom).toBeTruthy();
    });
    it('Should have an unlockRoom method', () => {
        service.unlockRoom().subscribe((response) => {
            expect(response).toBeTruthy();
        });
        expect(service.unlockRoom).toBeTruthy();
    });

    it('Should have a kickPlayer method', () => {
        service.kickPlayer('');
        expect(service.kickPlayer).toBeTruthy();
    });
});
