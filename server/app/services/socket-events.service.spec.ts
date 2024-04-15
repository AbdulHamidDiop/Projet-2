import { DatabaseService } from './database.service';
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameSessionService } from '@app/services/game-session.service';
import { Game, Player } from '@common/game';
import { GameSession } from '@common/game-session';
import { ChatMessage } from '@common/message';
import { Events, LOBBY } from '@common/sockets';
import { expect } from 'chai';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { SinonSpy, SinonStub, restore, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { Socket as ClientSocket, io } from 'socket.io-client';
import { SocketEvents } from './socket-events.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sinon = require('sinon');

describe('Socket Events Service', () => {
    let socketEvents: SocketEvents;
    let clientSocket: ClientSocket;
    let socket: Socket;
    let socketToStub: SinonStub;
    let socketOnStub: SinonStub;
    let socketEmitStub: SinonStub;
    let socketJoinStub: SinonStub;
    let socketIdStub: SinonSpy;
    let gameSessionService: any;
    const databaseService: DatabaseService = new DatabaseService();
    let server: Server;
    const httpServer = createServer();

    before((done) => {
        server = new Server(httpServer);
        gameSessionService = {
            addNbPlayers: sinon.stub(),
        };
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket = io(`http://localhost:${port}`);
            clientSocket.emit('');
            server.on('connection', (serverSocket: Socket) => {
                socket = serverSocket;
                socketIdStub = stub(socket, 'id').value('');
                socketOnStub = stub(socket, 'on').callsFake((eventName: any, callBackFn: any) => {
                    callBackFn({ id: '0', room: LOBBY, name: '', player: { name: '' } });
                    return socket;
                });
                socketEmitStub = stub(socket, 'emit').callsFake(() => {
                    return true;
                });
                socketJoinStub = stub(socket, 'join').callsFake(() => {
                    return;
                });

                socketToStub = stub(socket, 'to').callsFake(() => {
                    return {
                        to: () => {
                            return {
                                emit: () => {
                                    return;
                                },
                            };
                        },
                        emit: () => {
                            return;
                        },
                    } as any;
                });

                socketEvents.socketIdRoom.set(socket.id, LOBBY);
                socketEvents.playerSocketId.set(socket.id, { name: '', isHost: false } as Player);
                socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: '', isHost: false } as Player]);
                socketEvents.bannedNamesInRoom.set(LOBBY, []);
                socketEvents.liveRooms.push(LOBBY);
                socketEvents.chatHistories.set(LOBBY, [{} as ChatMessage]);
            });

            clientSocket.on('connect', done);
        });

        socketEvents = new SocketEvents(gameSessionService);
    });

    it('Should have a makeRoomId method', () => {
        const str = socketEvents.makeRoomId();
        expect(str.length).to.equal(4);
        expect(socketIdStub.notCalled).to.equal(true);
        expect(socketToStub.notCalled).to.equal(true);
    });

    it('Should call socket.emit on call to listenForCreateRoom', async () => {
        const initialRoomId = '1234';
        socketEvents.liveRooms.push(initialRoomId);

        let callCount = 0;
        socketEvents.makeRoomId = () => {
            if (!callCount) {
                callCount++;
                return initialRoomId;
            }
            return '5678';
        };
        gameSessionService = new GameSessionService(databaseService);
        sinon.stub(gameSessionService, 'createSession').resolves({ pin: 'gameId' } as GameSession);

        socketEvents.unitTesting = true;
        await socketEvents.onCreateRoom(socket, { game: { id: 'gameId' } as Game });
    });

    it('Should call socket.emit on call to listenForJoinRoom', () => {
        socket.on('listenForJoinRoom', () => {
            socketEvents.lockedRooms.push(LOBBY);
            socketEvents.listenForJoinRoomEvent(socket);
            socket.removeAllListeners(Events.JOIN_ROOM);
            socketEvents.lockedRooms = [];
            socketEvents.listenForJoinRoomEvent(socket);
            socketEvents.liveRooms = [];
            socketEvents.listenForJoinRoomEvent(socket);
            socketEvents.liveRooms = [LOBBY];
            expect(socketOnStub.called).to.equal(true);
            expect(socketEmitStub.called).to.equal(true);
        });
    });

    it('Should call socket.to on call to listenForExcludeFromChat', () => {
        socket.on('listenForExcludeFromChat', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForExcludeFromChat(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            const playerName = 'testPlayer';
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: playerName, chatEnabled: true } as Player]);
            socketEvents.playerSocketId.set(socket.id, { name: playerName, chatEnabled: true, isHost: true } as Player);
            socketEvents.listenForExcludeFromChat(socket);
            socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
            socketEvents.listenForExcludeFromChat(socket);
            expect(socketToStub.called).to.equal(true);
            expect(socketEvents.socketIdRoom.get(socket.id)).to.equal(LOBBY);
        });
    });

    it('Should call socket.emit on call to listenForIncludeInChat', () => {
        socket.on('listenForIncludeInChat', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForIncludeInChat(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: 'testPlayer' } as Player]);
            socketEvents.playerSocketId.set('.', { name: 'testPlayer' } as Player);
            socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
            socketEvents.listenForIncludeInChat(socket);
            socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
            socketEvents.listenForIncludeInChat(socket);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call socket.to on call to listenForAbandonGame', () => {
        socket.on('listenForAbandonGame', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForAbandonGame(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            const playerName = 'testPlayer';
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: playerName } as Player]);
            socketEvents.playerSocketId.set(socket.id, { name: playerName, isHost: true } as Player);
            socketEvents.listenForAbandonGame(socket);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call socket.on on call to listenForDeleteRoom', () => {
        socket.on('listenForDeleteRoom', () => {
            socketEvents.listenForDeleteRoomEvent(socket);
            expect(socketOnStub.called).to.equal(true);
            socketEvents.liveRooms.push(LOBBY);
        });
    });

    it('Should call socket.to on call to listenForLeaveRoom', () => {
        socket.on('listenForLeaveRoom', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForLeaveRoomEvent(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.lockedRooms.push(LOBBY);
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: '' } as Player]);
            socketEvents.listenForLeaveRoomEvent(socket);
            socket.removeAllListeners(Events.LEAVE_ROOM);
            socketEvents.playerSocketId.set(socket.id, { name: '', isHost: true } as Player);
            socketEvents.socketIdRoom.set('.', '');
            socketEvents.listenForLeaveRoomEvent(socket);
            expect(socketOnStub.called).to.equal(true);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call socket.join on call to listenForSetPlayerName', () => {
        socket.on('listenForSetPlayerName', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForSetPlayerNameEvent(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.liveRooms.push(LOBBY);
            socketEvents.playerSocketId.set(socket.id, { name: '' } as Player);
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: '' } as Player]);
            socketEvents.listenForSetPlayerNameEvent(socket);
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: '1' } as Player]);
            socketEvents.bannedNamesInRoom.set(LOBBY, ['']);
            socketEvents.listenForSetPlayerNameEvent(socket);
            socketEvents.bannedNamesInRoom.set(LOBBY, []);
            socketEvents.lockedRooms.push(LOBBY);
            socketEvents.listenForSetPlayerNameEvent(socket);
            socketEvents.lockedRooms = [];
            socketEvents.listenForSetPlayerNameEvent(socket);
            expect(socketJoinStub.called).to.equal(true);
        });
    });

    it('Should call socket.emit on call to listenForGetPlayerProfile', () => {
        socket.on('listenForGetPlayerProfile', () => {
            socketEvents.playerSocketId.set(socket.id, undefined);
            socketEvents.listenForGetPlayerProfileEvent(socket);
            socketEvents.playerSocketId.set(socket.id, {} as Player);
            socketEvents.listenForGetPlayerProfileEvent(socket);
            expect(socketEmitStub.called).to.equal(true);
        });
    });

    it('Should call socket.emit on call to listenForLockRoom', () => {
        socket.on('listenForLockRoom', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForLockRoomEvent(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.liveRooms.push(LOBBY);
            socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
            socketEvents.listenForLockRoomEvent(socket);
            socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
            socketEvents.listenForLockRoomEvent(socket);
            socketEvents.lockedRooms.push(LOBBY);
            socketEvents.listenForLockRoomEvent(socket);
            expect(socketEmitStub.called).to.equal(true);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call socket.emit on call to listenForUnlockRoom', () => {
        socket.on('listenForUnlockRoom', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForUnlockRoomEvent(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.liveRooms.push(LOBBY);
            socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
            socketEvents.listenForUnlockRoomEvent(socket);
            socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
            socketEvents.listenForUnlockRoomEvent(socket);
            expect(socketEmitStub.called).to.equal(true);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call socket.to on call to listenForKickPlayer', () => {
        socket.on('listenForKickPlayer', () => {
            socketEvents.socketIdRoom.set(socket.id, undefined);
            socketEvents.listenForKickPlayerEvent(socket);
            socketEvents.socketIdRoom.set(socket.id, LOBBY);
            socketEvents.mapOfPlayersInRoom.set(LOBBY, [{ name: '' } as Player]);
            socketEvents.playerSocketId.set('.', { name: '.' } as Player);
            socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
            socketEvents.listenForKickPlayerEvent(socket);
            socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
            socketEvents.listenForKickPlayerEvent(socket);
            expect(socketToStub.called).to.equal(true);
        });
    });

    it('Should call listenForCreateRoom on call to listenForEvents', () => {
        restore();
        const listenForCreateRoomStub = stub(socketEvents, 'listenForCreateRoomEvent').callsFake(() => {
            return;
        });
        socketEvents.listenForEvents(socket);
        socket.removeAllListeners();
        expect(listenForCreateRoomStub.called).to.equal(true);
    });

    it('Should listen For randomGameEvents', () => {
        const listenForStartRandomGameEventStub = stub(socketEvents, 'listenForStartRandomGameEvent').callsFake(() => {
            return;
        });
        socketEvents.listenForEvents(socket);
        socket.removeAllListeners();
        expect(listenForStartRandomGameEventStub.called).to.equal(true);
    });

    it('Should call socket.to on call to listenForStartGame', () => {
        socketEvents.socketIdRoom.set(socket.id, undefined);
        socketEvents.onStartGame(socket);
        socketEvents.socketIdRoom.set(socket.id, LOBBY);
        socketEvents.mapOfPlayersInRoom.set(LOBBY, [{} as Player]);
        socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
        socketEvents.lockedRooms = [LOBBY];
        socketEvents.onStartGame(socket);
        socketEvents.lockedRooms = [];
        socketEvents.onStartGame(socket);
        socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
        socketEvents.onStartGame(socket);
        expect(socketToStub.called).to.equal(true);
    });
    it('Should call socket.to on call to onStartRandomGame', () => {
        socketEvents.socketIdRoom.set(socket.id, undefined);

        socketEvents.onStartRandomGame(socket as Socket);
        socketEvents.socketIdRoom.set(socket.id, LOBBY);
        socketEvents.mapOfPlayersInRoom.set(LOBBY, [{} as Player]);
        socketEvents.playerSocketId.set(socket.id, { isHost: true } as Player);
        socketEvents.lockedRooms = [LOBBY];
        socketEvents.onStartRandomGame(socket as Socket);
        socketEvents.lockedRooms = [];
        socketEvents.onStartRandomGame(socket as Socket);
        socketEvents.playerSocketId.set(socket.id, { isHost: false } as Player);
        socketEvents.onStartRandomGame(socket as Socket);
        expect(socketToStub.called).to.equal(true);
    });

    it('Should emit GET_PLAYERS event with players when room and players exist', () => {
        socketEvents.socketIdRoom.set(socket.id, LOBBY);
        socketEvents.mapOfPlayersInRoom.set(LOBBY, [{} as Player]);
        socketEvents.onRequestPlayers(socket as Socket);
    });

    it('Should emit GET_PLAYERS event with empty array when room or players do not exist', () => {
        socketEvents.socketIdRoom.set(socket.id, undefined);
        socketEvents.onRequestPlayers(socket as Socket);
    });
});
