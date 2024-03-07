import { ChatMessage } from '@common/message';
/* eslint-disable no-console */
import { Application } from '@app/app';
import { Player } from '@common/game';
import { Events, Namespaces } from '@common/sockets';
import { CorsOptions } from 'cors';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private io: SocketIOServer;

    private liveRooms: string[] = ['0']; // room par defaut pour developpement
    private chatHistories: Map<string, ChatMessage[]> = new Map();
    // private bannedNamesInRoom: Map<string, string[]> = new Map();
    // private mapOfPlayersInRoom: Map<string, Player[]> = new Map();
    // private lockedRooms: string[] = [];
    private socketIdRoom: Map<string, string> = new Map(); // Gauche : socketId, droite : room.
    private liveRooms: string[] = [];
    private bannedNamesInRoom: Map<string, string[]> = new Map();
    private mapOfPlayersInRoom: Map<string, Player[]> = new Map();
    private lockedRooms: string[] = [''];
    private playerSocketId: Map<string, Player> = new Map();

    constructor(private readonly application: Application) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }

    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        const corsOptions: CorsOptions = { origin: ['http://localhost:4200'] };
        this.io = new SocketIOServer(this.server, { cors: corsOptions });

        this.configureGlobalNamespace();
        this.configureStaticNamespaces();
        this.configureDynamicNamespaces();
    }

    private configureGlobalNamespace(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('A user connected to the global namespace');

            socket.on(Events.CREATE_ROOM, (room: string) => {
                if (this.liveRooms.includes(room)) return;
                console.log(`Room created: ${room}`);
                this.liveRooms.push(room);
            });

            socket.on(Events.DELETE_ROOM, (room: string) => {
                console.log(`Room deleted: ${room}`);
                this.liveRooms = this.liveRooms.filter((liveRoom) => liveRoom !== room);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from global namespace');
            });
        });
    }

    private configureStaticNamespaces(): void {
        const chatNamespace = this.io.of(`/${Namespaces.CHAT_MESSAGES}`);
        const waitingRoomNamespace = this.io.of(`/${Namespaces.WAITING_ROOM}`);
        const gameStatsNamespace = this.io.of(`/${Namespaces.GAME_STATS}`);
        const gameNamespace = this.io.of(`/${Namespaces.GAME}`);
        const createGameNamespace = this.io.of(`/${Namespaces.CREATE_GAME}`);

        createGameNamespace.on('connection', (socket) => {
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
                this.bannedNamesInRoom.set(room, []);
                socket.emit(Events.JOIN_ROOM);
                socket.emit(Events.GET_GAME_ID, id);
                socket.emit(Events.CHAT_MESSAGE, { message: 'Vous avez rejoint la salle ' + room, room }); // Sert pour les tests.

                console.log('Created room ' + room);
            });
        });

        chatNamespace.on('connection', (socket) => {
            // Listener for joining a room within the chatMessages namespace
            this.setupDefaultJoinRoomEvent(socket);
            console.log('A user connected to the chatMessages namespace');

            // Listener for messages sent within a room of the chatMessages namespace

            socket.on(Events.CHAT_MESSAGE, (data) => {
                console.log(`Message received for room ${data.room}:`, data);
                socket.to(data.room).emit(Events.CHAT_MESSAGE, data);

                const chatMessage: ChatMessage = { author: data.author, message: data.message, timeStamp: data.timeStamp };
                if (!this.chatHistories.has(data.room)) this.chatHistories.set(data.room, [chatMessage]);
                else this.chatHistories.set(data.room, this.chatHistories.get(data.room).concat(chatMessage));
            });

            // Listener for chat history requests
            socket.on(Events.CHAT_HISTORY, (data) => {
                console.log(`Chat history requested for room: ${data.room}`);
                const chatHistory = this.chatHistories.get(data.room) || [];
                socket.emit(Events.CHAT_HISTORY, chatHistory);
            });

            // Handling user disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected from chatMessages namespace');
            });
        });

        waitingRoomNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            socket.on(Events.JOIN_ROOM, ({ room, username }) => {
                socket.to(room).emit(Events.WAITING_ROOM_NOTIFICATION, `${username} a rejoint la salle d'attente`);
            });

            socket.on(Events.SET_PLAYER_NAME, (name) => {
                if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                    const room = this.socketIdRoom.get(socket.id);
                    const player = this.playerSocketId.get(socket.id);
                    const playerList = this.mapOfPlayersInRoom.get(room);
                    if (
                        playerList.some((playerInRoom) => {
                            return playerInRoom.name === name;
                        })
                    ) {
                        socket.emit(Events.NAME_NOT_AVAILABLE);
                    } else {
                        player.name = name;
                        playerList.push(player);
                        socket.emit(Events.GET_PLAYERS, playerList);
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
                        const waitingRoom = this.socketIdRoom.get(socket.id);
                        if (this.lockedRooms.includes(waitingRoom)) {
                            socket.to(waitingRoom).emit(Events.LOCK_ROOM, true);
                        } else {
                            this.lockedRooms.push(waitingRoom);
                            socket.to(waitingRoom).emit(Events.LOCK_ROOM, true);
                        }
                    }
                }
            });

            socket.on(Events.UNLOCK_ROOM, () => {
                if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                    const player = this.playerSocketId.get(socket.id);
                    if (player.isHost) {
                        const waitingRoom = this.socketIdRoom.get(socket.id);
                        this.lockedRooms = this.lockedRooms.filter((lockedRoom) => {
                            return lockedRoom !== waitingRoom;
                        });
                        socket.to(waitingRoom).emit(Events.UNLOCK_ROOM, true);
                    }
                }
            });

            socket.on(Events.KICK_PLAYER, (message) => {
                if (this.socketInRoom(socket) && this.roomCreated(this.socketIdRoom.get(socket.id))) {
                    const player = this.playerSocketId.get(socket.id);
                    const waitingRoom = this.socketIdRoom.get(socket.id);
                    if (player.isHost) {
                        if (this.bannedNamesInRoom.get(waitingRoom).includes(message.name)) {
                            const playerList = this.mapOfPlayersInRoom.get(waitingRoom);
                            socket.to(waitingRoom).emit(Events.KICK_PLAYER, message.player);
                            socket.to(waitingRoom).emit(Events.GET_PLAYERS, playerList);
                        } else {
                            this.bannedNamesInRoom.get(waitingRoom).push(message.name);
                            socket.to(waitingRoom).emit(Events.KICK_PLAYER, message.player);
                            const playerList = this.mapOfPlayersInRoom.get(waitingRoom).filter((playerInRoom) => {
                                return playerInRoom.name !== message.player;
                            });
                            this.mapOfPlayersInRoom.set(waitingRoom, playerList);
                        }
                    }
                }
            });

            console.log('A user connected to the waitingRoom namespace');

            socket.on('disconnect', () => {
                console.log('User disconnected from waitingRoom namespace');
            });
        });

        gameStatsNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            console.log('A user connected to the gameStats namespace');

            socket.on(Events.QCM_STATS, (data) => {
                console.log(`Stats received for room ${data.room}:`, data);
                gameStatsNamespace.to(data.room).emit(Events.QCM_STATS, data);
            });

            socket.on(Events.QRL_STATS, (data) => {
                console.log(`Stats received for room ${data.room}:`, data);
                gameStatsNamespace.to(data.room).emit(Events.QRL_STATS, data);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from gameStats namespace');
            });
        });

        gameNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            console.log('A user connected to the game namespace');

            socket.on(Events.CREATE_ROOM, () => {
                let room = this.makeRoomId();
                while (this.liveRooms.includes(room)) {
                    room = this.makeRoomId();
                }
                socket.join(room);
                this.liveRooms.push(room);
                const player: Player = { name: 'Organisateur', score: 0, isHost: true, id: '', bonusCount: 0 };
                this.playerSocketId.set(socket.id, player);
                this.socketIdRoom.set(socket.id, room);
                this.mapOfPlayersInRoom.set(room, []);
                this.bannedNamesInRoom.set(room, []);
                console.log('Created room ' + room);
            });

            socket.on(Events.NEXT_QUESTION, ({ room }) => {
                console.log(`Moving to the next question in room: ${room}`);
                gameNamespace.in(room).emit(Events.NEXT_QUESTION);
            });

            socket.on(Events.END_GAME, ({ room }: { room: string }) => {
                console.log(`Ending the game in room: ${room}`);
                gameNamespace.in(room).emit(Events.END_GAME);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from game namespace');
            });
        });
    }

    private setupDefaultJoinRoomEvent(socket: Socket) {
        socket.on(Events.JOIN_ROOM, ({ room }: { room: string }) => {
            if (!room || !this.liveRooms.includes(room)) return;

            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
            console.log(`liveRooms: ${this.liveRooms}`);
        });
    }

    private configureDynamicNamespaces(): void {
        // Pas couvert pendant le cours.
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') throw error;
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
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
