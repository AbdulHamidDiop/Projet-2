/* eslint-disable no-console */
import { Application } from '@app/app';
import { ChatMessage } from '@common/message';
import { Events, LOBBY, Namespaces } from '@common/sockets';
import { CorsOptions } from 'cors';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { Service } from 'typedi';
import { GameSessionService } from './services/game-session.service';
import { SocketEvents } from './services/socket-events.service';

const ERROR_INDEX = -1;
@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private io: SocketIOServer;
    private chatHistories: Map<string, ChatMessage[]> = new Map();
    private liveRooms: string[] = [];

    constructor(
        private readonly application: Application,
        private socketEvents: SocketEvents,
        private gameSessionService: GameSessionService,
    ) {}

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
        this.liveRooms.push(LOBBY);
        this.chatHistories.set(LOBBY, []);
        this.configureGlobalNamespace();
        this.configureStaticNamespaces();
    }

    private configureGlobalNamespace(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.join(LOBBY);
            this.socketEvents.listenForEvents(socket);
        });
    }

    private configureStaticNamespaces(): void {
        const chatNamespace = this.io.of(`/${Namespaces.CHAT_MESSAGES}`);
        const waitingRoomNamespace = this.io.of(`/${Namespaces.WAITING_ROOM}`);
        const gameStatsNamespace = this.io.of(`/${Namespaces.GAME_STATS}`);
        const gameNamespace = this.io.of(`/${Namespaces.GAME}`);

        chatNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            socket.on(Events.CHAT_MESSAGE, (data) => {
                if (data.author === 'Système') {
                    this.io.to(data.room).emit(Events.CHAT_MESSAGE, data);
                } else {
                    socket.to(data.room).emit(Events.CHAT_MESSAGE, data);
                }
                const chatMessage: ChatMessage = { author: data.author, message: data.message, timeStamp: data.timeStamp };
                if (!this.chatHistories.has(data.room)) this.chatHistories.set(data.room, [chatMessage]);
                else this.chatHistories.set(data.room, this.chatHistories.get(data.room).concat(chatMessage));
            });

            socket.on(Events.CHAT_HISTORY, (data) => {
                const chatHistory = this.chatHistories.get(data.room) || [];
                socket.to(data.room).emit(Events.CHAT_HISTORY, chatHistory);
            });
        });

        waitingRoomNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            socket.on(Events.JOIN_ROOM, ({ room, username }) => {
                socket.to(room).emit(Events.WAITING_ROOM_NOTIFICATION, `${username} a rejoint la salle d'attente`);
            });
        });

        gameStatsNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            socket.on(Events.QCM_STATS, (data) => {
                socket.to(data.room).emit(Events.QCM_STATS, data);
            });

            socket.on(Events.QRL_STATS, (data) => {
                gameStatsNamespace.to(data.room).emit(Events.QRL_STATS, data);
            });

            socket.on(Events.GAME_RESULTS, (data) => {
                gameStatsNamespace.to(data.room).emit(Events.GAME_RESULTS, data);
            });

            socket.on(Events.UPDATE_CHART, (data) => {
                gameStatsNamespace.to(data.room).emit(Events.UPDATE_CHART);
            });

            socket.on(Events.UPDATE_PLAYER, (data) => {
                gameStatsNamespace.to(data.room).emit(Events.UPDATE_PLAYER, data);
            });

            socket.on(Events.GET_PLAYERS, (data) => {
                gameStatsNamespace.to(data.room).emit(Events.GET_PLAYERS, data);
            });
        });

        gameNamespace.on('connection', (socket) => {
            this.setupDefaultJoinRoomEvent(socket);
            socket.on(Events.SHOW_RESULTS, ({ room }) => {
                gameNamespace.in(room).emit(Events.SHOW_RESULTS);
            });

            socket.on(Events.PLAYER_LEFT, (data) => {
                gameNamespace.in(data.room).emit(Events.PLAYER_LEFT, data);
            });

            socket.on(Events.PLAYER_JOINED, (data) => {
                gameNamespace.in(data.room).emit(Events.PLAYER_JOINED, data);
            });

            socket.on(Events.NEXT_QUESTION, ({ room }) => {
                gameNamespace.to(room).emit(Events.NEXT_QUESTION);
            });

            socket.on(Events.QRL_ANSWER, (data) => {
                socket.in(data.room).emit(Events.QRL_ANSWER, data);
            });

            socket.on(Events.SEND_QRL_ANSWER, ({ room }) => {
                gameNamespace.to(room).emit(Events.SEND_QRL_ANSWER);
            });

            socket.on(Events.QRL_GRADE, (data) => {
                socket.in(data.room).emit(Events.QRL_GRADE, data);
            });

            socket.on(Events.END_GAME, ({ room }: { room: string }) => {
                gameNamespace.in(room).emit(Events.END_GAME);
            });

            socket.on(Events.CLEANUP_GAME, ({ room }: { room: string }) => {
                gameNamespace.in(room).emit(Events.CLEANUP_GAME);

                const index = this.liveRooms.indexOf(room);
                if (index > ERROR_INDEX) this.liveRooms.splice(index, 1);

                this.chatHistories.delete(room);

                this.gameSessionService.deleteSession(room);
            });

            socket.on(Events.ABORT_GAME, ({ room }: { room: string }) => {
                gameNamespace.in(room).emit(Events.ABORT_GAME);
            });

            socket.on(Events.START_TIMER, (data) => {
                gameNamespace.in(data.room).emit(Events.START_TIMER, data);
            });

            socket.on(Events.STOP_TIMER, ({ room }) => {
                gameNamespace.in(room).emit(Events.STOP_TIMER);
            });
            socket.on(Events.PAUSE_TIMER, ({ room }) => {
                gameNamespace.in(room).emit(Events.PAUSE_TIMER);
            });

            socket.on(Events.PANIC_MODE, (data) => {
                gameNamespace.in(data.room).emit(Events.PANIC_MODE, data);
            });

            socket.on(Events.PANIC_MODE_OFF, ({ room }) => {
                gameNamespace.to(room).emit(Events.PANIC_MODE_OFF);
            });

            socket.on(Events.FINAL_ANSWER, ({ room }: { room: string }) => {
                socket.emit(Events.BONUS);
                socket.to(room).emit(Events.BONUS_GIVEN);
            });
        });
    }

    private setupDefaultJoinRoomEvent(socket: Socket) {
        socket.on(Events.JOIN_ROOM, ({ room }: { room: string }) => {
            socket.join(room);
        });
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
}
