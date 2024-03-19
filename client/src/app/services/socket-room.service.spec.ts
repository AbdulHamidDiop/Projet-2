/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Game } from '@common/game';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Socket } from 'socket.io-client';
import { IoService } from './ioservice.service';
import { SocketRoomService } from './socket-room.service';
import SpyObj = jasmine.SpyObj;

describe('SocketRoomService', () => {
    let service: SocketRoomService;
    let socketMock: SpyObj<Socket>;
    let ioMock: SpyObj<IoService>;
    beforeEach(() => {
        socketMock = jasmine.createSpyObj('Socket', ['on', 'emit', 'off', 'disconnect']);
        socketMock.on.and.callFake((eventName: any, callBackFn: any) => {
            callBackFn();
            return socketMock;
        });
        socketMock.off.and.returnValue({} as any);
        socketMock.emit.and.returnValue({} as any);
        ioMock = jasmine.createSpyObj('IoService', ['io']);
        ioMock.io.and.returnValue(socketMock);
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Socket,
                    useValue: socketMock,
                },
                {
                    provide: IoService,
                    useValue: ioMock,
                },
            ],
        });
        service = TestBed.inject(SocketRoomService);
    });

    it('Should be a mock object', () => {
        expect(service.connected).toBeFalsy();
    });

    it('Should call socket.emit on call to createRoom', () => {
        const gameTest: Game = { id: '1', title: 'Game 1', isHidden: false, questions: [] };
        service.createRoom(gameTest);
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to joinRoom', () => {
        service.joinRoom('');
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to leaveRoom', () => {
        service.leaveRoom();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to sendChatMessage', () => {
        service.sendChatMessage({} as ChatMessage);
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to kickPlayer', () => {
        service.kickPlayer('');
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to lockRoom', () => {
        service.lockRoom();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to unlockRoom', () => {
        service.unlockRoom();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to sendPlayerName', () => {
        service.sendPlayerName('');
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to notifyNextQuestion', () => {
        service.notifyNextQuestion();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to notifyEndGame', () => {
        service.notifyEndGame();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to startGame', () => {
        service.startGame();
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.on on call to getPlayers', () => {
        service.getPlayers().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to lockSubscribe', () => {
        service.lockSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to unlockSubscribe', () => {
        service.unlockSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to kickSubscribe', () => {
        service.kickSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to getChatMessages', () => {
        service.getChatMessages().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to getProfile', () => {
        service.getProfile().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to gameStartSubscribe', () => {
        service.gameStartSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to roomJoinSubscribe', () => {
        service.roomJoinSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to onNextQuestion', () => {
        service.onNextQuestion().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to onEndGame', () => {
        service.onEndGame().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to getGameId', () => {
        service.getGameId().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to roomLockedSubscribe', () => {
        service.roomLockedSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to createRoomSubscribe', () => {
        service.createRoomSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to leaveRoomSubscribe', () => {
        service.leaveRoomSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
        service.leaveRoomSubscribe();
    });

    it('Should call socket.on on call to disconnectSubscribe', () => {
        service.disconnectSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to onGameResults', () => {
        service.onGameResults().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.emit on call to joinRoomInNamespace', () => {
        service.joinRoomInNamespace('', '');
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.emit on call to sendMessage', () => {
        service.sendMessage('' as Events, '' as Namespaces);
        expect(socketMock.emit).toHaveBeenCalled();
    });

    it('Should call socket.on on call to listenForMessages', () => {
        service.listenForMessages('' as Namespaces, '' as Events).subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.disconnect on call to disconnect', () => {
        service.disconnect();
        expect(socketMock.disconnect).toHaveBeenCalled();
    });
});
