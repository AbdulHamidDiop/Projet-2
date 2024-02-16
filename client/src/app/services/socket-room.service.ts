import { Injectable } from '@angular/core';
import { Player } from '@common/game';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

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

    // Function to join a room
    joinRoom(): void {
        this.socket.emit('joinRoom', this.room);
    }

    // La validation devra se faire du coté du serveur.
    lockRoom(): Observable<boolean> {
        this.socket.emit('lockRoom', this.room);
        return new Observable((observer) => {
            this.socket.on('lockRoom', (response) => {
                observer.next(response);
            });
            return () => this.socket.off('lockRoom');
        });
    }

    unlockRoom(): Observable<boolean> {
        this.socket.emit('unlockRoom', this.room);
        return new Observable((observer) => {
            this.socket.on('unlockRoom', (response) => {
                observer.next(response);
            });
            return () => this.socket.off('unlockRoom');
        });
    }

    kickPlayer(name: string) {
        const room = this.room;
        this.socket.emit('kickPlayer', { room, name });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getPlayers(): Observable<Player[]> {
        this.socket.emit('getPlayers', this.room);
        return new Observable((observer) => {
            this.socket.on('getPlayers', (players) => {
                observer.next(players);
            });
            return () => this.socket.off('getPlayers');
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

    // Function to disconnect from the server (optional)
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    sendChatMessage(message: string) {
        const room = this.room;
        this.socket.emit('chatMessage', { room, message });
    }

    getChatMessages(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('chatMessage', (message) => {
                observer.next(message.message);
            });
            // Handle observable cleanup
            return () => this.socket.off('chatMessage');
        });
    }
}
