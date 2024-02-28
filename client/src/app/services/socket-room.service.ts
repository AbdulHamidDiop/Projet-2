import { Injectable } from '@angular/core';
import { Player } from '@common/game';
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
    private name: string = 'admin';

    constructor() {
        // Connect to the Socket.IO server
        this.socket = io(this.url);
        this.socket.on('disconnect', () => {
            this.disconnect();
        });
    }

    // Function to join a room
    joinRoom(): void {
        const room = this.room;
        const name = this.name;
        this.socket.emit('joinRoom', { room, name });
    }

    // La validation devra se faire du coté du serveur.
    lockRoom(name: string): void {
        this.socket.emit('lockRoom', name);
    }

    lockSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on('lockRoom', (response) => {
                observer.next(response);
            });
            return () => this.socket.off('lockRoom');
        });
    }

    unlockRoom(name: string): void {
        this.socket.emit('unlockRoom', name);
    }

    unlockSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on('unlockRoom', (response) => {
                observer.next(response);
            });
            return () => this.socket.off('unlockRoom');
        });
    }

    kickPlayer(name: string, player: string) {
        this.socket.emit('kickPlayer', { name, player });
    }

    kickSubscribe(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('kickPlayer', (response) => {
                observer.next(response);
            });
            return () => this.socket.off('kickPlayer');
        });
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

    onEvent<T>(event: string): Observable<T> {
        return new Observable<T>((observer) => {
            this.socket.on(event, (data: T) => {
                observer.next(data);
            });
        });
    }

    // Host tells clients to move to the next question
    notifyNextQuestion(): void {
        this.sendMessage('nextQuestion');
    }

    // // Listen for the 'nextQuestion' event
    // onNextQuestion(): Observable<void> {
    //     return new Observable<void>((observer) => {
    //         this.socket.on('nextQuestion', () => observer.next());
    //     });
    // }

    // Example: End the game
    notifyEndGame(): void {
        this.sendMessage('endGame');
    }

    onEndGame(): Observable<void> {
        return new Observable<void>((observer) => {
            this.socket.on('endGame', () => observer.next());
        });
    }

    // Example: Subscribe to game results
    onGameResults(): Observable<unknown> {
        return this.onEvent<unknown>('gameResults');
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
