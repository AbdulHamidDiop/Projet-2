/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
        socketMock.on.and.callFake((_eventName: any, callBackFn: any) => {
            callBackFn();
            return socketMock;
        });
        socketMock.off.and.returnValue({} as any);
        ioMock = jasmine.createSpyObj('IoService', ['io']);
        ioMock.io.and.returnValue(socketMock);
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, BrowserAnimationsModule],
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
        service.unitTests = true;
    });

    const createMockNamespaceSocket = (emitSuccess: boolean, emitResponse = { success: true }): any => {
        return {
            emit: (event: any, data: any, callback: any) => {
                if (emitSuccess) {
                    callback(emitResponse);
                }
            },
        };
    };

    it('Should be a mock object', () => {
        expect(service.connected).toBeFalsy();
    });

    it('Should call socket.emit on call to createRoom', () => {
        const gameTest: Game = { id: '1', title: 'Game 1', isHidden: false, questions: [] };
        service.createRoom(gameTest);
        expect(socketMock.emit).toHaveBeenCalledWith(Events.CREATE_ROOM, { game: gameTest });
        expect(socketMock.emit).toHaveBeenCalledTimes(1); // En lisant le code ça devrait être appelé 1 seule fois.
    });

    it('Should call socket.emit on call to joinRoom', () => {
        const roomId = '1111';
        service.joinRoom(roomId);
        expect(socketMock.emit).toHaveBeenCalledWith(Events.JOIN_ROOM, { room: roomId });
        expect(socketMock.emit).toHaveBeenCalledTimes(1); // En lisant le code ça devrait être appelé 1 seule fois.
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
        const playerName = 'hello';
        service.kickPlayer(playerName);
        expect(socketMock.emit).toHaveBeenCalledWith(Events.KICK_PLAYER, { playerName });
    });

    it('Should call socket.emit on call to lockRoom', () => {
        service.lockRoom();
        expect(socketMock.emit).toHaveBeenCalledWith(Events.LOCK_ROOM);
    });

    it('Should call socket.emit on call to unlockRoom', () => {
        service.unlockRoom();
        expect(socketMock.emit).toHaveBeenCalledWith(Events.UNLOCK_ROOM);
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
            expect(socketMock.on).toHaveBeenCalledWith(Events.GET_PLAYERS, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to getPlayers', () => {
        service.getStats().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.QCM_STATS, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to lockSubscribe', () => {
        service.lockSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.LOCK_ROOM, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to unlockSubscribe', () => {
        service.unlockSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.UNLOCK_ROOM, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to kickSubscribe', () => {
        service.kickSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.KICK_PLAYER, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to getChatMessages', () => {
        service.getChatMessages().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to getProfile', () => {
        service.getProfile().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.GET_PLAYER_PROFILE, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to gameStartSubscribe', () => {
        service.gameStartSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
    });

    it('Should call socket.on on call to roomJoinSubscribe', () => {
        service.roomJoinSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.JOIN_ROOM, jasmine.any(Function));
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
            expect(socketMock.on).toHaveBeenCalledWith(Events.GET_GAME_ID, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to roomLockedSubscribe', () => {
        service.roomLockedSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.LOCK_ROOM, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to createRoomSubscribe', () => {
        service.createRoomSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.CREATE_ROOM, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to leaveRoomSubscribe', () => {
        service.leaveRoomSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.LEAVE_ROOM, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to disconnectSubscribe', () => {
        service.disconnectSubscribe().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith('disconnect', jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to onGameResults', () => {
        service.onGameResults().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalled();
        });
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

    it('Should call socket.on on call to onNameNotAvailable', () => {
        service.onNameNotAvailable().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.NAME_NOT_AVAILABLE, jasmine.any(Function));
        });
    });

    it('Should call socket.on on call to nameBanned', () => {
        service.onNameBanned().subscribe(() => {
            expect(socketMock.on).toHaveBeenCalledWith(Events.BANNED_NAME, jasmine.any(Function));
        });
    });

    it('Should call io on call to connectNamespace', () => {
        service.connectNamespace('');
        expect(ioMock.io).toHaveBeenCalled();
    });

    it('Should call io on call to connectNamespace', () => {
        service.connectNamespace('');
        expect(ioMock.io).toHaveBeenCalled();
    });

    it('Should call sendMessage on call to endGame', () => {
        service.playerService.player.name = 'Organisateur';
        service.endGame();
        expect(ioMock.io).toHaveBeenCalled();
    });

    it('Should call io on call to joinAllNamespaces', fakeAsync(() => {
        service.joinAllNamespaces('');
        expect(ioMock.io).toHaveBeenCalled();
    }));

    it('Should call emit on call to joinRoomInNamespace', fakeAsync(() => {
        socketMock.emit.and.callFake((event: any, params: any, callBackFn: any) => {
            callBackFn({ success: true });
            callBackFn(undefined);
            return socketMock;
        });
        service.joinRoomInNamespace('', '');
        expect(socketMock.emit).toHaveBeenCalled();
    }));

    it('should notify other players when a player leaves the room', () => {
        spyOn(service, 'sendChatMessage');
        service.unitTests = true;
        service.room = 'room';
        service.endGame();
        expect(service.sendChatMessage).toHaveBeenCalled();
    });

    it('joins a room successfully', (done) => {
        spyOn(service, 'connectNamespace').and.returnValue(createMockNamespaceSocket(true));

        service
            .joinRoomInNamespace('namespace', 'room')
            .then(() => {
                expect(service.connectNamespace).toHaveBeenCalledWith('namespace');
                done();
            })
            .catch(done.fail);
    });

    it('fails to join a room due to server error', (done) => {
        spyOn(service, 'connectNamespace').and.returnValue(createMockNamespaceSocket(true, { success: false }));

        service.joinRoomInNamespace('namespace', 'room').then(
            () => {
                done.fail('Expected method to reject.');
            },
            (error) => {
                expect(error.message).toBe('Failed to join room');
                done();
            },
        );
    });

    it('fails due to undefined namespace socket', (done) => {
        spyOn(service, 'connectNamespace').and.returnValue(undefined);

        service.joinRoomInNamespace('namespace', 'room').then(
            () => {
                done.fail('Expected method to reject.');
            },
            (error) => {
                expect(error.message).toBe('Namespace socket is undefined');
                done();
            },
        );
    });
});
