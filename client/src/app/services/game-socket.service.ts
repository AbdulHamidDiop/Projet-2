import { Injectable } from '@angular/core';
import { SOCKET_URL } from '@common/consts';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class GameSocketService {
    private socket: Socket;

    constructor() {
        this.connect();
    }

    // Emit events to the server
    emit(event: string, data?: unknown): void {
        this.socket.emit(event, data);
    }

    // Listen for events from the server
    onEvent<T>(event: string): Observable<T> {
        return new Observable<T>((observer) => {
            this.socket.on(event, (data: T) => {
                observer.next(data);
            });
        });
    }

    // Host tells clients to move to the next question
    notifyNextQuestion(): void {
        this.emit('nextQuestion');
    }

    // Listen for the 'nextQuestion' event
    onNextQuestion(): Observable<void> {
        return new Observable<void>((observer) => {
            this.socket.on('nextQuestion', () => observer.next());
        });
    }

    // Example: End the game
    notifyEndGame(): void {
        this.emit('endGame');
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

    // Handle disconnection (Optional based on your game's needs)
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    private connect(): void {
        // Connect to the WebSocket server
        this.socket = io(SOCKET_URL, {
            // Optional: add options here if needed
        });

        // Optional: Handle any global events or configurations here
        // this.socket.on('connect', () => console.log('Connected to game server'));
    }
}
