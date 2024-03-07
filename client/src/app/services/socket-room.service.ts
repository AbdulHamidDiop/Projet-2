import { Injectable } from '@angular/core';
import { Player } from '@common/game';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
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
    private namespaces: Map<string, Socket> = new Map();

    constructor() {
        this.socket = io(this.url);
    }

    get connected() {
        return this.socket.connected;
    }

    createRoom(gameId: string) {
        this.socket.emit(Events.CREATE_ROOM, { id: gameId });
    }
    // Function to join a room
    joinRoom(roomId: string) {
        this.socket.emit(Events.JOIN_ROOM, { room: roomId });
    }

    roomJoinSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.JOIN_ROOM, () => {
                observer.next();
            });
            return () => this.socket.off(Events.JOIN_ROOM);
        });
    }

    getGameId(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_GAME_ID, (id) => {
                observer.next(id);
            });
            return () => this.socket.off(Events.GET_GAME_ID);
        });
    }

    // La validation devra se faire du coté du serveur.
    lockRoom(): void {
        this.socket.emit(Events.LOCK_ROOM);
    }

    roomLockedSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on(Events.LOCK_ROOM, (response) => {
                observer.next(response);
            });
            return () => this.socket.off(Events.LOCK_ROOM);
        });
    }

    lockSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on(Events.LOCK_ROOM, (response) => {
                observer.next(response);
            });
            return () => this.socket.off(Events.LOCK_ROOM);
        });
    }

    unlockRoom(): void {
        this.socket.emit(Events.UNLOCK_ROOM);
    }

    unlockSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on(Events.UNLOCK_ROOM, (response) => {
                observer.next(response);
            });
            return () => this.socket.off(Events.UNLOCK_ROOM);
        });
    }

    createRoomSubscribe(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.CREATE_ROOM, (response) => {
                observer.next(response);
            });
            return () => this.socket.off(Events.CREATE_ROOM);
        });
    }

    kickPlayer(playerName: string) {
        this.socket.emit(Events.KICK_PLAYER, { playerName });
    }

    kickSubscribe(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.KICK_PLAYER, (response) => {
                observer.next(response);
            });
            return () => this.socket.off(Events.KICK_PLAYER);
        });
    }

    disconnectSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on('disconnect', () => {
                observer.next();
            });
            return () => this.socket.off('disconnect');
        });
    }

    getPlayers(): Observable<Player[]> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_PLAYERS, (players) => {
                observer.next(players);
            });
            return () => this.socket.off(Events.GET_PLAYERS);
        });
    }

    getProfile(): Observable<Player> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_PLAYER_PROFILE, (player) => {
                observer.next(player);
            });
            return () => this.socket.off(Events.GET_PLAYER_PROFILE);
        });
    }

    leaveRoom(): void {
        this.socket.emit(Events.LEAVE_ROOM, this.room);
    }

    sendPlayerName(name: string): void {
        this.socket.emit(Events.SET_PLAYER_NAME, name);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    sendChatMessage(message: ChatMessage) {
        this.socket.emit(Events.CHAT_MESSAGE, message);
    }

    getChatMessages(): Observable<ChatMessage> {
        return new Observable((observer) => {
            this.socket.on(Events.CHAT_MESSAGE, (message: ChatMessage) => {
                observer.next(message);
            });
            return () => this.socket.off(Events.CHAT_MESSAGE);
        });
    }

    startGame(): void {
        this.socket.emit(Events.START_GAME);
    }

    gameStartSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.START_GAME, () => {
                observer.next();
            });
            return () => this.socket.off(Events.START_GAME);
        });
    }

    joinRoomInNamespace(namespace: string, room: string): void {
        const namespaceSocket = this.connectNamespace(namespace);
        if (namespaceSocket) {
            namespaceSocket.emit('joinRoom', { room });
        }
    }

    // eslint-disable-next-line max-params
    sendMessage(eventName: Events, namespace: Namespaces, room: string, payload?: object): void {
        if (namespace !== Namespaces.GLOBAL_NAMESPACE) {
            const namespaceSocket = this.connectNamespace(namespace);
            if (namespaceSocket) {
                namespaceSocket.emit(eventName, { room, ...payload });
            }
        } else {
            this.socket.emit(eventName, { room, ...payload });
        }
    }

    listenForMessages(namespace: string, eventName: string): Observable<unknown> {
        const namespaceSocket = this.connectNamespace(namespace);
        return new Observable((observer) => {
            if (namespaceSocket) {
                const messageHandler = (message: unknown) => observer.next(message);
                namespaceSocket.on(eventName, messageHandler);
                return () => {
                    namespaceSocket.off(eventName, messageHandler);
                };
            }
            return;
        });
    }

    private connectNamespace(namespace: string): Socket | undefined {
        if (!this.namespaces.has(namespace)) {
            const namespaceSocket = io(`${this.url}/${namespace}`);
            this.namespaces.set(namespace, namespaceSocket);
        }
        return this.namespaces.get(namespace);
    }
}
