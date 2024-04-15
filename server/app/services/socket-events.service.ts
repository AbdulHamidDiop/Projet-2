import { GameSessionService } from '@app/services/game-session.service';
import { BLACK, DEFAULT_HOST_PROFILE, DEFAULT_PLAYER_PROFILE, Game, Player } from '@common/game';
import { ChatMessage, EXCLUDE_FROM_CHAT_MESSAGE, INCLUDE_IN_CHAT_MESSAGE, ROOM_UNLOCKED_MESSAGE, SystemMessages as sysmsg } from '@common/message';
import { Events, LOBBY } from '@common/sockets';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
@Service()
export class SocketEvents {
    chatHistories: Map<string, ChatMessage[]> = new Map();
    roomGameId: Map<string, string> = new Map();
    socketIdRoom: Map<string, string> = new Map();
    liveRooms: string[] = [];
    bannedNamesInRoom: Map<string, string[]> = new Map();
    mapOfPlayersInRoom: Map<string, Player[]> = new Map();
    lockedRooms: string[] = [''];
    playerSocketId: Map<string, Player> = new Map();
    unitTesting = false;
    constructor(private gameSessionService: GameSessionService) {
        this.liveRooms.push(LOBBY);
    }
    listenForEvents(socket: Socket) {
        this.socketIdRoom.set(socket.id, LOBBY);
        this.listenForCreateRoomEvent(socket);
        this.listenForDeleteRoomEvent(socket);
        this.listenForJoinRoomEvent(socket);
        this.listenForIncludeInChat(socket);
        this.listenForExcludeFromChat(socket);
        this.listenForSetPlayerNameEvent(socket);
        this.listenForGetPlayerProfileEvent(socket);
        this.listenForLockRoomEvent(socket);
        this.listenForUnlockRoomEvent(socket);
        this.listenForKickPlayerEvent(socket);
        this.listenForStartGameEvent(socket);
        this.listenForStartRandomGameEvent(socket);
        this.listenForRequestPlayersEvent(socket);
        this.listenForLeaveRoomEvent(socket);
        this.listenForAbandonGame(socket);
    }
    listenForCreateRoomEvent(socket: Socket) {
        socket.on(Events.CREATE_ROOM, async ({ game }: { game: Game }) => {
            await this.onCreateRoom(socket, { game });
        });
    }
    async onCreateRoom(socket: Socket, { game }: { game: Game }) {
        const id = game.id;
        let room = this.makeRoomId();
        while (this.liveRooms.includes(room)) {
            room = this.makeRoomId();
        }
        if (!this.unitTesting) {
            // creates testing errors errors otherwise à régler si necessaire
            await this.gameSessionService.createSession(room, game);
        }
        socket.join(room);
        const player: Player = { ...DEFAULT_HOST_PROFILE };
        this.liveRooms.push(room);
        this.socketIdRoom.set(socket.id, room);
        this.playerSocketId.set(socket.id, player);
        this.mapOfPlayersInRoom.set(room, []);
        this.bannedNamesInRoom.set(room, ['organisateur', 'Organisateur']); // Le nom organisateur est banni dans toute les rooms.
        this.roomGameId.set(room, id);
        socket.emit(Events.JOIN_ROOM, true);
        socket.emit(Events.GET_GAME_PIN, room);
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
    }
    listenForJoinRoomEvent(socket: Socket) {
        socket.on(Events.JOIN_ROOM, ({ room }) => {
            if (this.lockedRooms.includes(room)) {
                socket.emit(Events.LOCK_ROOM);
            } else if (this.liveRooms.includes(room)) {
                this.socketIdRoom.set(socket.id, room);
                const playerProfile: Player = {
                    ...DEFAULT_PLAYER_PROFILE,
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
            this.deleteRoom(socket, room);
        });
    }
    listenForLeaveRoomEvent(socket: Socket) {
        socket.on(Events.LEAVE_ROOM, () => {
            const player = this.playerSocketId.get(socket.id);
            const room = this.socketIdRoom.get(socket.id);
            if (room && player && player.isHost) {
                this.deleteRoom(socket, room);
            } else if (room) {
                socket.emit(Events.LEAVE_ROOM);
                const players = this.mapOfPlayersInRoom.get(room)?.filter((value) => value.name !== player.name);
                this.mapOfPlayersInRoom.set(room, players);
                socket.to(room).emit(Events.GET_PLAYERS, players);
            }
        });
    }
    listenForSetPlayerNameEvent(socket: Socket) {
        socket.on(Events.SET_PLAYER_NAME, ({ name }) => {
            const room = this.socketIdRoom.get(socket.id); // 3 possibilités de ne pas rejoindre une room
            if (room && this.nameNotAvailable(room, name)) {
                socket.emit(Events.NAME_NOT_AVAILABLE); // Nom déja pris
            } else if (room && this.bannedNamesInRoom.get(room).includes(name)) {
                socket.emit(Events.BANNED_NAME, name); // Nom banni
            } else if (room && this.lockedRooms.includes(room)) {
                socket.emit(Events.LOCK_ROOM); // Salle verrouillée
                this.socketIdRoom.set(socket.id, LOBBY);
                socket.emit(Events.LEAVE_ROOM);
            } else if (room) {
                this.joinWaitingPageRoom(socket, room, name);
            }
        });
    }
    listenForGetPlayerProfileEvent(socket: Socket) {
        socket.on(Events.GET_PLAYER_PROFILE, () => {
            const player = this.playerSocketId.get(socket.id);
            if (player) {
                socket.emit(Events.GET_PLAYER_PROFILE, player);
            }
        });
    }
    listenForLockRoomEvent(socket: Socket) {
        socket.on(Events.LOCK_ROOM, () => {
            const player = this.playerSocketId.get(socket.id);
            if (player && player.isHost) {
                const room = this.socketIdRoom.get(socket.id);
                this.lockedRooms.push(room);
            }
        });
    }
    listenForUnlockRoomEvent(socket: Socket) {
        socket.on(Events.UNLOCK_ROOM, () => {
            const player = this.playerSocketId.get(socket.id);
            if (player && player.isHost) {
                const room = this.socketIdRoom.get(socket.id);
                this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                    return lockedRoom !== room;
                });
                socket.emit(Events.UNLOCK_ROOM);
                const unlockMessage: ChatMessage = { ...ROOM_UNLOCKED_MESSAGE };
                unlockMessage.timeStamp = new Date().toLocaleTimeString();
                socket.emit(Events.CHAT_MESSAGE, unlockMessage);
            }
        });
    }
    listenForKickPlayerEvent(socket: Socket) {
        socket.on(Events.KICK_PLAYER, ({ playerName }) => {
            const host = this.playerSocketId.get(socket.id);
            const room = this.socketIdRoom.get(socket.id);
            if (room && host && host.isHost) {
                const socketIdOfPlayerToKick: string = this.findSocketIdOfPlayer(room, playerName);
                socket.to(socketIdOfPlayerToKick).emit(Events.KICK_PLAYER);
                this.bannedNamesInRoom.get(room).push(playerName);
                this.removePlayerFromPlayerList(socket, room, playerName);
            }
        });
    }
    listenForStartGameEvent(socket: Socket) {
        socket.on(Events.START_GAME, () => {
            this.onStartGame(socket);
        });
    }
    onStartGame(socket: Socket) {
        const host = this.playerSocketId.get(socket.id);
        const room = this.socketIdRoom.get(socket.id);
        const players = this.mapOfPlayersInRoom.get(room);
        if (host && host.isHost && players.length > 0) {
            if (this.lockedRooms.includes(room)) {
                this.gameSessionService?.addNbPlayers(room, players.length);
                socket.to(room).emit(Events.START_GAME);
                socket.emit(Events.START_GAME);
                socket.to(room).emit(Events.GET_PLAYERS, players);
                socket.emit(Events.START_GAME);
            } else {
                socket.emit(Events.UNLOCK_ROOM);
            }
        }
    }
    listenForStartRandomGameEvent(socket: Socket) {
        socket.on(Events.START_RANDOM_GAME, () => {
            this.onStartRandomGame(socket);
        });
    }
    onStartRandomGame(socket: Socket) {
        const host = this.playerSocketId.get(socket.id);
        const room = this.socketIdRoom.get(socket.id);
        const players = this.mapOfPlayersInRoom.get(room);
        if (host && room && players && this.lockedRooms.includes(room)) {
            host.isHost = false;
            players.push(host);
            this.gameSessionService?.addNbPlayers(room, players.length);
            socket.to(room).emit(Events.START_RANDOM_GAME);
            socket.emit(Events.START_RANDOM_GAME);
            socket.to(room).emit(Events.GET_PLAYERS, players);
            socket.emit(Events.START_RANDOM_GAME);
        } else {
            socket.emit(Events.UNLOCK_ROOM);
        }
    }
    listenForAbandonGame(socket: Socket) {
        socket.on(Events.ABANDON_GAME, () => {
            const room = this.socketIdRoom.get(socket.id);
            const player = this.playerSocketId.get(socket.id);
            if (room && player) {
                const players = this.mapOfPlayersInRoom.get(room);
                for (const play of players) {
                    if (play.name === player.name) {
                        play.leftGame = true;
                        play.color = BLACK;
                    }
                }
                socket.to(room).emit(Events.GET_PLAYERS, players);
                socket.emit(Events.ABANDON_GAME);
            }
        });
    }
    listenForExcludeFromChat(socket: Socket) {
        socket.on(Events.EXCLUDE_FROM_CHAT, ({ player }) => {
            const host = this.playerSocketId.get(socket.id);
            const room = this.socketIdRoom.get(socket.id);
            if (room && host && (host.isHost || host.name === 'Organisateur')) {
                this.setChatEnabledStatus(socket, room, player.name, false);
            }
        });
    }
    listenForIncludeInChat(socket: Socket) {
        socket.on(Events.INCLUDE_IN_CHAT, ({ player }) => {
            const host = this.playerSocketId.get(socket.id);
            const room = this.socketIdRoom.get(socket.id);
            if (room && host && (host.isHost || host.name === 'Organisateur')) {
                this.setChatEnabledStatus(socket, room, player.name, true);
            }
        });
    }
    listenForRequestPlayersEvent(socket: Socket) {
        socket.on(Events.GET_PLAYERS, () => {
            this.onRequestPlayers(socket);
        });
    }
    onRequestPlayers(socket: Socket) {
        const room = this.socketIdRoom.get(socket.id);
        const players = this.mapOfPlayersInRoom.get(room);
        if (room && players) {
            socket.to(room).emit(Events.GET_PLAYERS, players);
            socket.emit(Events.GET_PLAYERS, players);
        } else {
            socket.emit(Events.GET_PLAYERS, []);
        }
    }
    makeRoomId(): string {
        const ID_LENGTH = 4;
        const MAX_DIGIT = 10;
        let id = '';
        for (let i = 0; i < ID_LENGTH; i++) {
            const index = Math.floor(Math.random() * MAX_DIGIT);
            id = id.concat(index.toString());
        }
        return id;
    }
    // Le 4ième paramètre permets de faire fonctionner l'implémentation pour les 2 fonctionnalités ( inclure et exclure du chat )
    // eslint-disable-next-line max-params
    private setChatEnabledStatus(socket: Socket, room: string, name: string, chatEnabled: boolean) {
        const socketIdOfPlayerToExclude = this.findSocketIdOfPlayer(room, name);
        const message: ChatMessage = chatEnabled ? { ...INCLUDE_IN_CHAT_MESSAGE } : { ...EXCLUDE_FROM_CHAT_MESSAGE };
        message.timeStamp = new Date().toLocaleTimeString();
        socket.to(socketIdOfPlayerToExclude).emit(Events.CHAT_MESSAGE, message);
        const playerProfile = this.playerSocketId.get(socketIdOfPlayerToExclude);
        if (playerProfile) {
            playerProfile.chatEnabled = chatEnabled;
        }
        this.playerSocketId.set(socketIdOfPlayerToExclude, playerProfile);
        socket.to(socketIdOfPlayerToExclude).emit(Events.GET_PLAYER_PROFILE, playerProfile);
        const players = this.mapOfPlayersInRoom.get(room);
        for (const play of players) {
            if (play && play.name === name) {
                play.chatEnabled = chatEnabled;
            }
        }
        socket.to(room).emit(Events.GET_PLAYERS, players);
        socket.emit(Events.GET_PLAYERS, players);
    }
    private nameNotAvailable(room: string, name: string) {
        const playerList = this.mapOfPlayersInRoom.get(room);
        return playerList && playerList.some((playerInRoom) => playerInRoom.name.toLowerCase() === name.toLowerCase());
    }
    private findSocketIdOfPlayer(room: string, name: string) {
        for (const key of this.playerSocketId.keys()) {
            if (this.playerSocketId.get(key) && this.playerSocketId.get(key).name === name && this.socketIdRoom.get(key) === room) return key;
        }
        return undefined;
    }
    private removePlayerFromPlayerList(socket: Socket, room: string, name: string) {
        const playerList = this.mapOfPlayersInRoom.get(room).filter((playerInRoom) => playerInRoom.name !== name);
        this.mapOfPlayersInRoom.set(room, playerList);
        socket.to(room).emit(Events.GET_PLAYERS, playerList);
        socket.emit(Events.GET_PLAYERS, playerList);
    }
    private joinWaitingPageRoom(socket: Socket, room: string, name: string) {
        const player = this.playerSocketId.get(socket.id);
        const playerList = this.mapOfPlayersInRoom.get(room);
        socket.join(room);
        player.name = name;
        socket.emit(Events.GET_PLAYER_PROFILE, player);
        playerList.push(player);
        socket.emit(Events.GET_PLAYERS, playerList);
        socket.to(room).emit(Events.GET_PLAYERS, playerList);
        socket.emit(Events.GET_GAME_PIN, room);
        const message: ChatMessage = {
            author: sysmsg.AUTHOR,
            message: name + ' ' + sysmsg.PLAYER_JOINED,
            timeStamp: new Date().toLocaleTimeString(),
        };
        socket.to(room).emit(Events.CHAT_MESSAGE, message);
        socket.emit(Events.CHAT_MESSAGE, message);
    }
    private deleteRoom(socket: Socket, room: string) {
        this.bannedNamesInRoom.delete(room);
        this.liveRooms = this.liveRooms.filter((liveRoom) => liveRoom !== room);
        this.mapOfPlayersInRoom.delete(room);
        this.lockedRooms = this.lockedRooms.filter((lockedRoom) => lockedRoom !== room);
        this.roomGameId.delete(room);
        for (const key of this.socketIdRoom.keys()) {
            if (this.socketIdRoom.get(key) === room) {
                this.socketIdRoom.set(key, LOBBY);
            }
        }
        socket.emit(Events.LEAVE_ROOM);
        socket.to(room).emit(Events.LEAVE_ROOM);
    }
}
