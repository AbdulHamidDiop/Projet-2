/* eslint-disable no-console */
import { Application } from '@app/app';
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

    // private bannedNames: string[] = [''];

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

        this.configureStaticNamespaces();
        this.configureDynamicNamespaces();
    }

    private configureStaticNamespaces(): void {
        const chatNamespace = this.io.of(`/${Namespaces.CHAT_MESSAGES}`);
        const waitingRoomNamespace = this.io.of(`/${Namespaces.WAITING_ROOM}`);
        const gameStatsNamespace = this.io.of(`/${Namespaces.GAME_STATS}`);
        const gameNamespace = this.io.of(`/${Namespaces.GAME}`);

        chatNamespace.on('connection', (socket) => {
            console.log('A user connected to the chatMessages namespace');

            // Listener for joining a room within the chatMessages namespace
            socket.on(Events.JOIN_ROOM, ({ room }: { room: string }) => {
                console.log(`Joining room: ${room}`);
                socket.join(room);
            });

            // Listener for messages sent within a room of the chatMessages namespace
            socket.on(Events.CHAT_MESSAGE, (data) => {
                console.log(`Message received for room ${data.room}:`, data);
                socket.to(data.room).emit(Events.CHAT_MESSAGE, data);
            });

            // Handling user disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected from chatMessages namespace');
            });
        });

        waitingRoomNamespace.on('connection', (socket) => {
            console.log('A user connected to the waitingRoom namespace');

            socket.on(Events.JOIN_ROOM, ({ room, username }) => {
                console.log(`Joining room: ${room}`);
                socket.join(room);

                socket.to(room).emit(Events.WAITING_ROOM_NOTIFICATION, `${username} a rejoint la salle d'attente`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from waitingRoom namespace');
            });
        });

        gameStatsNamespace.on('connection', (socket) => {
            console.log('A user connected to the gameStats namespace');

            socket.on(Events.JOIN_ROOM, ({ room }: { room: string }) => {
                console.log(`Joining room: ${room}`);
                socket.join(room);
            });

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
            console.log('A user connected to the game namespace');

            socket.on(Events.JOIN_ROOM, ({ room }) => {
                console.log(`Joining room: ${room}`);
                socket.join(room);
            });

            socket.on(Events.NEXT_QUESTION, ({ room }) => {
                console.log(`Moving to the next question in room: ${room}`);
                gameNamespace.in(room).emit(Events.NEXT_QUESTION);
            });

            socket.on(Events.END_GAME, ({ room }) => {
                console.log(`Ending the game in room: ${room}`);
                gameNamespace.in(room).emit(Events.END_GAME);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from game namespace');
            });
        });
    }

    private configureDynamicNamespaces(): void {
        // Listen for connections to any namespace
        this.io.of(/^\/\w+$/).on('connection', (socket: Socket) => {
            const namespace = socket.nsp.name;
            console.log(`A user connected to namespace: ${namespace}`);

            // Directly handle room joining here
            socket.on('joinRoom', ({ room }) => {
                if (room) {
                    socket.join(room);
                    console.log(`Socket ${socket.id} joined room: ${room} in namespace: ${namespace}`);
                }
            });

            // Handle messages within the namespace, for a specific room
            socket.on('message', (data: { room: string; payload: unknown }) => {
                const { room, payload } = data;
                socket.nsp.to(room).emit('message', payload);
                console.log(`Message sent to room: ${room} in namespace: ${namespace}`, payload);
            });
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
