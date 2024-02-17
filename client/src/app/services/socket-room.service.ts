import { Injectable } from '@angular/core';
import { SOCKET_URL } from '@common/consts';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
// On peut ajouter des nouvelles fonctionnalités selon les besoins des components.
export class SocketRoomService {
    private socket: Socket;
    private url = SOCKET_URL; // Your Socket.IO server URL
    private room: string = '0';

    constructor() {
        // Connect to the Socket.IO server
        this.socket = io(this.url);
    }

    // Function to join a room
    joinRoom(): void {
        this.socket.emit('joinRoom', this.room);
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
            // Handle observable cleanup
            return () => this.socket.off('message');
        });
    }

    // Function to leave a room
    leaveRoom(): void {
        this.socket.emit('leaveRoom', this.room);
    }

    // Host tells clients to move to the next question
    notifyNextQuestion(): void {
        this.sendMessage('nextQuestion');
    }

    // Listen for the 'nextQuestion' event
    onNextQuestion(): Observable<void> {
        return new Observable<void>((observer) => {
            this.socket.on('nextQuestion', () => observer.next());
        });
    }

    // Example: End the game
    notifyEndGame(): void {
        this.sendMessage('endGame');
    }

    onEndGame(): Observable<void> {
        return new Observable<void>((observer) => {
            this.socket.on('endGame', () => observer.next());
        });
    }

    // Function to disconnect from the server (optional)
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
