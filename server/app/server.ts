import { Application } from '@app/app';
import { CorsOptions } from 'cors';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private io: SocketIOServer;

    private bannedNames: string[] = [''];
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

        // SocketIO
        const corsOptions: CorsOptions = {
            origin: ['http://localhost:4200'],
        };
        this.io = new SocketIOServer(this.server, { cors: corsOptions });
        this.configureSocketIO();
    }

    private configureSocketIO(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('joinRoom', (message) => {
                if (this.bannedNames.includes(message.name)) {
                    socket.emit('disconnect');
                }
            });
            socket.on('createRoom', (room: string) => {
                leaveAllRooms(socket);
                socket.join(room);
            });

            socket.on('joinRoom', (room: string) => {
                leaveAllRooms(socket);
                socket.join(room);
            });

            socket.on('message', (data: { room: string; message: string }) => {
                this.io.to(data.room).emit('message', data.message);
            });

            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('User disconnected from socket');
            });

            socket.on('chatMessage', (message) => {
                socket.broadcast.emit('chatMessage', message);
            });

            socket.on('lockRoom', (message) => {
                // eslint-disable-next-line no-console
                console.log(message);
                if (message === 'admin') {
                    socket.emit('lockRoom', true);
                    socket.broadcast.emit('lockRoom', true);
                } else {
                    socket.emit('lockRoom', false);
                }
            });

            socket.on('unlockRoom', (message) => {
                // eslint-disable-next-line no-console
                console.log(message);
                if (message === 'admin') {
                    socket.emit('unlockRoom', true);
                    socket.broadcast.emit('unlockRoom', true);
                } else {
                    socket.emit('unlockRoom', false);
                }
            });

            socket.on('kickPlayer', (message) => {
                if (message.name === 'admin') {
                    this.bannedNames.push(message.name);
                    socket.broadcast.emit('kickPlayer', message.player);
                }
            });
        });

        const leaveAllRooms = (socket: Socket) => {
            const rooms = Object.keys(socket.rooms);
            rooms.forEach((room) => {
                socket.leave(room);
                // eslint-disable-next-line no-console
                console.log(`Room left ${room}`);
            });
        };
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
