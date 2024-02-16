import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
// On peut ajouter des nouvelles fonctionnalités selon les besoins des components.
export class SocketRoomService {
    private socket: Socket;
    private url = 'http://localhost:3000'; // Your Socket.IO server URL
    private room: string = '0';
    constructor() {
        // Connect to the Socket.IO server
        this.socket = io(this.url);
    }

    createRoom(room: string): void {
        this.socket.emit('createRoom', room);
        this.room = room;
    }

    // Function to join a room
    joinRoom(room: string): void {
        this.socket.emit('joinRoom', room);
        this.room = room;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getPlayers(): Observable<any> {
        this.socket.emit('getPlayers', this.room);
        return new Observable((observer) => {
            this.socket.on('getPlayers', (players) => {
                observer.next(players);
            });
            return () => this.socket.off('message');
        });
    }

    // Function to send a message to the server
    sendMessage(message: string): void {
        const room = this.room;
        this.socket.emit('message', { room, message });
    }

    // Function to listen for messages from the server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMessage(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('message', (message) => {
                observer.next(message);
            });
            return () => this.socket.off('message');
        });
    }

    // Function to leave a room
    leaveRoom(): void {
        this.socket.emit('leaveRoom', this.room);
    }

    // Function to disconnect from the server (optional)
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
