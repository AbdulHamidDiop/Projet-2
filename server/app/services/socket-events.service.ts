/* eslint-disable max-lines */
import { GameSessionService } from '@app/services/game-session.service';
import { Game, Player } from '@common/game';
import { ChatMessage, ROOM_UNLOCKED_MESSAGE, SystemMessages as sysmsg } from '@common/message';
import { Events, LOBBY } from '@common/sockets';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { SocketFunctions } from './socket-functions';
@Service()
export class SocketEvents {
    socketFunctions: SocketFunctions;
    chatHistories: Map<string, ChatMessage[]> = new Map();
    roomGameId: Map<string, string> = new Map();
    socketIdRoom: Map<string, string> = new Map(); // Gauche : socketId, droite : room.
    liveRooms: string[] = [];
    bannedNamesInRoom: Map<string, string[]> = new Map();
    mapOfPlayersInRoom: Map<string, Player[]> = new Map();
    lockedRooms: string[] = [''];
    playerSocketId: Map<string, Player> = new Map();
    constructor(private gameSessionService: GameSessionService) {
        this.liveRooms.push(LOBBY);
    }
    listenForEvents(socket: Socket) {
        this.socketIdRoom.set(socket.id, LOBBY);
        this.listenForCreateRoomEvent(socket);
        this.listenForDeleteRoomEvent(socket);
        this.listenForJoinRoomEvent(socket);
        this.listenForChatMessageEvent(socket);
        this.listenForIncludeInChat(socket);
        this.listenForExcludeFromChat(socket);
        this.listenForSetPlayerNameEvent(socket);
        this.listenForGetPlayerProfileEvent(socket);
        this.listenForLockRoomEvent(socket);
        this.listenForUnlockRoomEvent(socket);
        this.listenForKickPlayerEvent(socket);
        this.listenForStartGameEvent(socket);
        this.listenForRequestPlayersEvent(socket);
        this.listenForLeaveRoomEvent(socket);
        this.listenForAbandonGame(socket);
    }
    listenForCreateRoomEvent(socket: Socket) {
        socket.on(Events.CREATE_ROOM, async ({ game }: { game: Game }) => {
            const id = game.id;
            let room = this.makeRoomId();
            while (this.liveRooms.includes(room)) {
                room = this.makeRoomId();
            }
            await this.gameSessionService.createSession(room, game);
            // leaveAllRooms(socket); À ajouter plus tard.
            socket.join(room);
            const player: Player = { name: 'Organisateur', score: 0, isHost: true, id: '', bonusCount: 0, chatEnabled: true, outOfRoom: false };
            this.liveRooms.push(room);
            this.socketIdRoom.set(socket.id, room);
            this.playerSocketId.set(socket.id, player);
            this.mapOfPlayersInRoom.set(room, []);
            this.bannedNamesInRoom.set(room, ['organisateur']); // Le nom organisateur est banni dans toute les rooms.
            this.chatHistories.set(room, []);
            this.roomGameId.set(room, id);
            socket.emit(Events.JOIN_ROOM, true);
            socket.emit(Events.GET_GAME_ID, id);
            socket.emit(Events.GET_PLAYER_PROFILE, player);
            socket.emit(Events.GET_PLAYERS, []);
            const message: ChatMessage = {
                message: 'La salle ' + room + ' a été crée',
                author: 'Système',
                timeStamp: new Date().toLocaleTimeString(),
            };
            socket.emit(Events.CHAT_MESSAGE, message);
            const roomMessage: ChatMessage = {
                author: 'room',
                message: room,
                timeStamp: new Date().toLocaleTimeString(),
            };
            socket.emit(Events.CHAT_MESSAGE, roomMessage);
        });
    }
    listenForJoinRoomEvent(socket: Socket) {
        socket.on(Events.JOIN_ROOM, ({ room }) => {
            if (this.lockedRooms.includes(room)) {
                socket.emit(Events.LOCK_ROOM);
            } else if (this.liveRooms.includes(room)) {
                const RED = 0xff0000; // À mettre dans un fichier global.
                this.socketIdRoom.set(socket.id, room);
                const playerProfile: Player = {
                    id: '',
                    name: 'Player',
                    isHost: false,
                    score: 0,
                    bonusCount: 0,
                    color: RED,
                    chatEnabled: true,
                    outOfRoom: false,
                };
                this.playerSocketId.set(socket.id, playerProfile);
                socket.emit(Events.JOIN_ROOM, true);
                // L'évènement joinroom est envoyé mais le socket n'est pas encore dans le room au sens connection.
                // Le socket rejoint le room après avoir envoyé son nom et que celui-ci est validé.
            } else {
                socket.emit(Events.JOIN_ROOM, false);
            }
        });
    }
    listenForDeleteRoomEvent(socket: Socket) {
        socket.on(Events.DELETE_ROOM, (room: string) => {
            this.liveRooms = this.liveRooms.filter((liveRoom) => liveRoom !== room);
            this.bannedNamesInRoom.delete(room);
            this.liveRooms = this.liveRooms.filter((liveRoom) => {
                return liveRoom !== room;
            });
            this.mapOfPlayersInRoom.delete(room);
            this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                return lockedRoom !== room;
            });
            this.roomGameId.delete(room);
            for (const key of this.socketIdRoom.keys()) {
                if (this.socketIdRoom.get(key) === room) {
                    this.socketIdRoom.set(key, LOBBY);
                }
            }
            this.chatHistories.delete(room);
            socket.emit(Events.LEAVE_ROOM);
            socket.to(room).emit(Events.LEAVE_ROOM);
        });
    }
    listenForLeaveRoomEvent(socket: Socket) {
        socket.on(Events.LEAVE_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const player = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                if (player.isHost) {
                    this.bannedNamesInRoom.delete(room);
                    this.liveRooms = this.liveRooms.filter((liveRoom) => {
                        return liveRoom !== room;
                    });
                    this.mapOfPlayersInRoom.delete(room);
                    this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                        return lockedRoom !== room;
                    });
                    this.roomGameId.delete(room);
                    for (const key of this.socketIdRoom.keys()) {
                        if (this.socketIdRoom.get(key) === room) {
                            this.socketIdRoom.set(key, LOBBY);
                        }
                    }
                    this.chatHistories.delete(room);
                    socket.emit(Events.LEAVE_ROOM);
                    socket.to(room).emit(Events.LEAVE_ROOM);
                } else {
                    const players = this.mapOfPlayersInRoom.get(room).filter((value) => {
                        return value.name !== player.name;
                    });
                    this.mapOfPlayersInRoom.set(room, players);
                    socket.to(room).emit(Events.GET_PLAYERS, players);
                    socket.emit(Events.LEAVE_ROOM);
                }
            }
        });
    }
    listenForChatMessageEvent(socket: Socket) {
        socket.on(Events.CHAT_MESSAGE, (message: ChatMessage) => {
            const room = this.socketIdRoom.get(socket.id);
            if (room !== undefined && this.chatHistories.get(room) !== undefined) {
                socket.to(room).emit(Events.CHAT_MESSAGE, message);
                this.chatHistories.get(room).push(message);
            }
        });
        socket.on(Events.CHAT_HISTORY, () => {
            const room = this.socketIdRoom.get(socket.id);
            if (room !== undefined) {
                const chatHistory = this.chatHistories.get(room);
                if (chatHistory !== undefined) {
                    socket.emit(Events.CHAT_HISTORY, chatHistory);
                }
            }
        });
    }
    listenForSetPlayerNameEvent(socket: Socket) {
        socket.on(Events.SET_PLAYER_NAME, ({ name }) => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const room = this.socketIdRoom.get(socket.id);
                const player = this.playerSocketId.get(socket.id);
                const playerList = this.mapOfPlayersInRoom.get(room);
                const gameId = this.roomGameId.get(room);
                if (
                    playerList.some((playerInRoom) => {
                        return playerInRoom.name === name;
                    })
                ) {
                    socket.emit(Events.NAME_NOT_AVAILABLE);
                } else if (this.bannedNamesInRoom.get(room).includes(name)) {
                    socket.emit(Events.KICK_PLAYER, name);
                } else if (this.lockedRooms.includes(room)) {
                    socket.emit(Events.LOCK_ROOM);
                    this.socketIdRoom.set(socket.id, LOBBY);
                    socket.emit(Events.LEAVE_ROOM);
                } else {
                    socket.join(room);
                    player.name = name;
                    socket.emit(Events.GET_PLAYER_PROFILE, player);
                    playerList.push(player);
                    socket.emit(Events.GET_PLAYERS, playerList);
                    socket.to(room).emit(Events.GET_PLAYERS, playerList);
                    socket.emit(Events.GET_GAME_ID, gameId);
                    const message: ChatMessage = {
                        author: sysmsg.AUTHOR,
                        message: name + ' ' + sysmsg.PLAYER_JOINED,
                        timeStamp: new Date().toLocaleTimeString(),
                    };
                    socket.to(room).emit(Events.CHAT_MESSAGE, message);
                    socket.emit(Events.CHAT_MESSAGE, message);
                }
            }
        });
    }
    listenForGetPlayerProfileEvent(socket: Socket) {
        socket.on(Events.GET_PLAYER_PROFILE, () => {
            const player = this.playerSocketId.get(socket.id);
            if (player !== undefined) {
                socket.emit(Events.GET_PLAYER_PROFILE, player);
            }
        });
    }
    listenForLockRoomEvent(socket: Socket) {
        socket.on(Events.LOCK_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const player = this.playerSocketId.get(socket.id);
                if (player.isHost) {
                    const room = this.socketIdRoom.get(socket.id);
                    this.lockedRooms.push(room);
                }
            }
        });
    }
    listenForUnlockRoomEvent(socket: Socket) {
        socket.on(Events.UNLOCK_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const player = this.playerSocketId.get(socket.id);
                if (player.isHost) {
                    const room = this.socketIdRoom.get(socket.id);
                    this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                        return lockedRoom !== room;
                    });
                    socket.emit(Events.UNLOCK_ROOM);
                    const unlockMessage: ChatMessage = { ...ROOM_UNLOCKED_MESSAGE };
                    unlockMessage.timeStamp = new Date().toLocaleTimeString();
                    socket.emit(Events.CHAT_MESSAGE, unlockMessage);
                }
            }
        });
    }
    listenForKickPlayerEvent(socket: Socket) {
        socket.on(Events.KICK_PLAYER, ({ playerName }) => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const host = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                if (host.isHost) {
                    const socketIdOfPlayerToKick: string[] = [];
                    for (const key of this.playerSocketId.keys()) {
                        if (this.playerSocketId.get(key).name === playerName && this.socketIdRoom.get(key) === room) {
                            socketIdOfPlayerToKick.push(key);
                        }
                    }
                    socket.to(socketIdOfPlayerToKick).emit(Events.KICK_PLAYER);
                    const playerList = this.mapOfPlayersInRoom.get(room).filter((playerInRoom) => {
                        return playerInRoom.name !== playerName;
                    });
                    this.mapOfPlayersInRoom.set(room, playerList);
                    socket.to(room).emit(Events.GET_PLAYERS, playerList);
                    socket.emit(Events.GET_PLAYERS, playerList);
                    this.bannedNamesInRoom.get(room).push(playerName);
                }
            }
        });
    }
    listenForStartGameEvent(socket: Socket) {
        socket.on(Events.START_GAME, () => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const host = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                const players = this.mapOfPlayersInRoom.get(room);
                if (host && host.isHost && players.length > 0) {
                    if (this.lockedRooms.includes(room)) {
                        socket.to(room).emit(Events.START_GAME);
                        socket.emit(Events.START_GAME);
                        socket.to(room).emit(Events.GET_PLAYERS, players);
                        socket.emit(Events.GET_PLAYERS, players);
                    } else {
                        socket.emit(Events.UNLOCK_ROOM);
                    }
                }
            }
        });
    }
    listenForAbandonGame(socket: Socket) {
        if (this.socketInRoom(socket) && this.roomCreated(socket)) {
            const player = this.playerSocketId.get(socket.id);
            const room = this.socketIdRoom.get(socket.id);
            if (player.isHost) {
                // À revoir + tard.
            } else {
                const players = this.mapOfPlayersInRoom.get(room);
                for (const play of players) {
                    if (play.name === player.name) {
                        play.outOfRoom = true;
                    }
                }
                this.mapOfPlayersInRoom.set(room, players);
                socket.to(room).emit(Events.GET_PLAYERS, players);
                socket.emit('abandonGame'); // Mettre le event dans Events.
            }
        }
    }
    listenForExcludeFromChat(socket: Socket) {
        socket.on('excludeFromChat', ({ player }) => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const host = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                if (host.isHost) {
                    const players = this.mapOfPlayersInRoom.get(room);
                    for (const play of players) {
                        if (play.name === player.name) {
                            play.chatEnabled = false;
                        }
                    }
                }
            }
        });
    }
    listenForIncludeInChat(socket: Socket) {
        socket.on('includeInChat', ({ player }) => {
            if (this.socketInRoom(socket) && this.roomCreated(socket)) {
                const host = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                if (host.isHost) {
                    const players = this.mapOfPlayersInRoom.get(room);
                    for (const play of players) {
                        if (play.name === player.name) {
                            play.chatEnabled = true;
                        }
                    }
                }
            }
        });
    }
    listenForRequestPlayersEvent(socket: Socket) {
        socket.on(Events.GET_PLAYERS, () => {
            const room = this.socketIdRoom.get(socket.id);
            const players = this.mapOfPlayersInRoom.get(room);
            socket.to(room).emit(Events.GET_PLAYERS, players);
            socket.emit(Events.GET_PLAYERS, players);
        });
    }
    makeRoomId(): string {
        const digits = '123456789';
        const ID_LENGTH = 4;
        const indices: number[] = [];
        for (let i = 0; i < ID_LENGTH; i++) {
            const index = Math.floor(Math.random() * digits.length);
            indices.push(index);
        }
        let id = '';
        for (let i = 0; i < ID_LENGTH; i++) {
            id = id.concat(digits[indices[i]]);
        }
        return id;
    }
    socketInRoom(socket: Socket): boolean {
        return this.socketIdRoom.get(socket.id) !== undefined && this.playerSocketId.get(socket.id) !== undefined;
    }
    roomCreated(socket: Socket): boolean {
        const room = this.socketIdRoom.get(socket.id);
        return this.liveRooms.includes(room) && this.mapOfPlayersInRoom.has(room);
    }
}
