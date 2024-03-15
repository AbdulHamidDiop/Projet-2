import { Player } from '@common/game';
import { ChatMessage } from '@common/message';
import { Events, LOBBY } from '@common/sockets';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class SocketEvents {
    private chatHistories: Map<string, ChatMessage[]> = new Map();
    private roomGameId: Map<string, string> = new Map();
    private socketIdRoom: Map<string, string> = new Map(); // Gauche : socketId, droite : room.
    private liveRooms: string[] = [];
    private bannedNamesInRoom: Map<string, string[]> = new Map();
    private mapOfPlayersInRoom: Map<string, Player[]> = new Map();
    private lockedRooms: string[] = [''];
    private playerSocketId: Map<string, Player> = new Map();

    listenForEvents(socket: Socket) {
        this.socketIdRoom.set(socket.id, LOBBY);

        socket.on(Events.CREATE_ROOM, ({ id }) => {
            let room = this.makeRoomId();
            while (this.liveRooms.includes(room)) {
                room = this.makeRoomId();
            }
            // leaveAllRooms(socket); À ajouter plus tard.
            socket.join(room);
            const player: Player = { name: 'Organisateur', score: 0, isHost: true, id: '', bonusCount: 0 };
            this.liveRooms.push(room);
            this.socketIdRoom.set(socket.id, room);
            this.playerSocketId.set(socket.id, player);
            this.mapOfPlayersInRoom.set(room, []);
            this.bannedNamesInRoom.set(room, ['organisateur']); // Le nom organisateur est banni dans toute les rooms.
            this.chatHistories.set(room, []);
            this.roomGameId.set(room, id);
            socket.emit(Events.JOIN_ROOM);
            socket.emit(Events.GET_GAME_ID, id);
            socket.emit(Events.GET_PLAYER_PROFILE, player);
            socket.emit(Events.GET_PLAYERS, []);
            const message: ChatMessage = {
                message: 'La salle ' + room + ' a été crée',
                author: 'Système',
                timeStamp: new Date().toLocaleTimeString(),
            };
            socket.emit(Events.CHAT_MESSAGE, message); // Sert pour les tests.

            const roomMessage: ChatMessage = {
                author: 'room',
                message: room,
                timeStamp: new Date().toLocaleTimeString(),
            };
            socket.emit(Events.CHAT_MESSAGE, roomMessage); // pour recuperer le nom de la room, à changer pour QA
        });

        socket.on(Events.JOIN_ROOM, ({ room }) => {
            if (this.lockedRooms.includes(room)) {
                socket.emit(Events.LOCK_ROOM, true);
            } else if (this.liveRooms.includes(room)) {
                this.socketIdRoom.set(socket.id, room);
                const playerProfile: Player = { id: '', name: 'Player', isHost: false, score: 0, bonusCount: 0 };
                this.playerSocketId.set(socket.id, playerProfile);
                socket.emit(Events.JOIN_ROOM); // L'évènement joinroom est envoyé mais le socket n'est pas encore dans le room au sens connection.
                // Le socket rejoint le room après avoir envoyé son nom et que celui-ci est validé.
            }
        });

        socket.on(Events.DELETE_ROOM, (room: string) => {
            this.liveRooms = this.liveRooms.filter((liveRoom) => liveRoom !== room);
        });

        socket.on(Events.LEAVE_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
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

        socket.on(Events.SET_PLAYER_NAME, (name) => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
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
                }
            }
        });

        socket.on(Events.GET_PLAYER_PROFILE, () => {
            const player = this.playerSocketId.get(socket.id);
            if (player !== undefined) {
                socket.emit(Events.GET_PLAYER_PROFILE, player);
            }
        });

        socket.on(Events.LOCK_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                const player = this.playerSocketId.get(socket.id);
                if (player.isHost) {
                    const room = this.socketIdRoom.get(socket.id);
                    if (this.lockedRooms.includes(room)) {
                        socket.emit(Events.LOCK_ROOM, true);
                    } else {
                        this.lockedRooms.push(room);
                        socket.to(room).to(socket.id).emit(Events.LOCK_ROOM);
                    }
                }
            }
        });

        socket.on(Events.UNLOCK_ROOM, () => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                const player = this.playerSocketId.get(socket.id);
                if (player.isHost) {
                    const room = this.socketIdRoom.get(socket.id);
                    this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                        return lockedRoom !== room;
                    });
                    socket.emit(Events.UNLOCK_ROOM);
                }
            }
        });

        socket.on(Events.KICK_PLAYER, ({ playerName }) => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
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
                    this.bannedNamesInRoom.get(room).push(playerName);
                }
            }
        });

        socket.on(Events.START_GAME, () => {
            if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                const host = this.playerSocketId.get(socket.id);
                const room = this.socketIdRoom.get(socket.id);
                const players = this.mapOfPlayersInRoom.get(room);
                if (host.isHost && players.length > 0) {
                    if (this.lockedRooms.includes(room)) {
                        socket.to(room).emit(Events.START_GAME);
                        socket.emit(Events.START_GAME);
                    } else {
                        socket.emit(Events.UNLOCK_ROOM);
                    }
                }
            }
        });
    }

    private makeRoomId(): string {
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
    private socketInRoom(socket: Socket): boolean {
        if (this.socketIdRoom.get(socket.id) === undefined) {
            return false;
        } else if (this.playerSocketId.get(socket.id) === undefined) {
            return false;
        } else {
            return true;
        }
    }
    private roomCreated(room: string): boolean {
        if (this.mapOfPlayersInRoom.get(room) === undefined) {
            return false;
        } else if (this.bannedNamesInRoom.get(room) === undefined) {
            return false;
        } else {
            return this.liveRooms.includes(room);
        }
    }
}
