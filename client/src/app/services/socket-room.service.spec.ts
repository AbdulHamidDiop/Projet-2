import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketRoomService } from './socket-room.service';

describe('SocketRoomService', () => {
    let service: SocketRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Socket,
                    useValue: {
                        on: () => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            return of(true);
                        },
                        emit: () => {
                            return;
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(SocketRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should have a getPlayers method', () => {
        service.getPlayers().subscribe((players) => {
            expect(players).toBeTruthy();
        });
        expect(service.getPlayers).toBeTruthy();
    });

    it('Should have a leaveRoom method', () => {
        service.leaveRoom();
        expect(service.leaveRoom).toBeTruthy();
    });

    it('Should have a joinRoom method', () => {
        service.joinRoom('');
        expect(service.joinRoom).toBeTruthy();
    });

    it('Should have a disconnect method', () => {
        service.disconnect();
        expect(service.disconnect).toBeTruthy();
    });

    it('Should have a lockRoom method', () => {
        service.lockRoom();
        service.lockSubscribe().subscribe((response) => {
            expect(response).toBeTruthy();
        });
        expect(service.lockRoom).toBeTruthy();
    });
    it('Should have an unlockRoom method', () => {
        service.unlockRoom();
        service.unlockSubscribe().subscribe((response) => {
            expect(response).toBeTruthy();
        });
        expect(service.unlockRoom).toBeTruthy();
    });

    it('Should have a kickPlayer method', () => {
        service.kickPlayer('', '');
        expect(service.kickPlayer).toBeTruthy();
    });

    it('Should have a lockSubscribe method', () => {
        service.lockSubscribe();
        expect(service.lockSubscribe).toBeTruthy();
    });

    it('Should have an unlockSubscribe method', () => {
        service.unlockSubscribe().subscribe((message) => {
            expect(message).toBeTruthy();
        });
        expect(service.unlockSubscribe).toBeTruthy();
    });

    it('Should have a kickSubscribe method', () => {
        service.kickSubscribe().subscribe((message) => {
            expect(message).toBeTruthy();
        });
        expect(service.kickSubscribe).toBeTruthy();
    });

    it('Should have a sendChatMessage method', () => {
        service.sendChatMessage('');
        expect(service.sendChatMessage).toBeTruthy();
    });

    it('Should have a getChatMessages method', () => {
        service.getChatMessages().subscribe((message) => {
            expect(message).toBeTruthy();
        });
        expect(service.getChatMessages).toBeTruthy();
    });
});
