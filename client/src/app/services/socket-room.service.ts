import { Injectable } from '@angular/core';
import { Game, Player, Question } from '@common/game';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { IoService } from './ioservice.service';

@Injectable({
    providedIn: 'root',
})
// On peut ajouter des nouvelles fonctionnalités selon les besoins des components.
export class SocketRoomService {
    room: string;
    private socket: Socket;
    private url = 'http://localhost:3000'; // Your Socket.IO server URL
    private namespaces: Map<string, Socket> = new Map();

    constructor(private io: IoService) {
        this.socket = io.io(this.url);
    }

    get connected() {
        return this.socket.connected;
    }

    createRoom(gameId: string) {
        this.socket.emit(Events.CREATE_ROOM, { id: gameId });
    }

    joinRoom(roomId: string) {
        this.socket.emit(Events.JOIN_ROOM, { room: roomId });
    }

    roomJoinSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.JOIN_ROOM, () => {
                observer.next();
            });
        });
    }

    getGameId(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_GAME_ID, (id) => {
                observer.next(id);
            });
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
        });
    }

    lockSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on(Events.LOCK_ROOM, (response) => {
                observer.next(response);
            });
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
        });
    }

    createRoomSubscribe(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.CREATE_ROOM, (response) => {
                observer.next(response);
            });
        });
    }

    leaveRoomSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.LEAVE_ROOM, () => {
                observer.next();
            });
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
        });
    }

    disconnectSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on('disconnect', () => {
                observer.next();
            });
        });
    }

    getPlayers(): Observable<Player[]> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_PLAYERS, (players) => {
                observer.next(players);
            });
        });
    }

    getProfile(): Observable<Player> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_PLAYER_PROFILE, (player) => {
                observer.next(player);
            });
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
        this.sendMessage(Events.CHAT_MESSAGE, Namespaces.CHAT_MESSAGES, message);
    }

    getChatMessages(): Observable<ChatMessage> {
        return new Observable((observer) => {
            this.socket.on(Events.CHAT_MESSAGE, (message: ChatMessage) => {
                observer.next(message);
            });
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
        });
    }

    notifyNextQuestion(): void {
        this.socket.emit(Events.NEXT_QUESTION);
    }

    onNextQuestion(): Observable<Question> {
        return new Observable((observer) => {
            this.socket.on(Events.NEXT_QUESTION, () => observer.next());
        });
    }

    notifyEndGame(): void {
        this.socket.emit(Events.END_GAME);
    }

    onEndGame(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.END_GAME, () => observer.next());
        });
    }

    onGameResults(): Observable<Game> {
        return new Observable((observer) => {
            this.socket.on(Events.GAME_RESULTS, (results) => observer.next(results));
        });
    }

    joinRoomInNamespace(namespace: string, room: string): void {
        const namespaceSocket = this.connectNamespace(namespace);
        if (namespaceSocket) {
            namespaceSocket.emit(Events.JOIN_ROOM, { room });
        }
    }

    joinAllNamespaces(room: string): void {
        for (const namespace of Object.values(Namespaces)) {
            this.joinRoomInNamespace(namespace, room);
        }
    }

    // eslint-disable-next-line max-params
    sendMessage(eventName: Events, namespace: Namespaces, payload?: object): void {
        if (namespace !== Namespaces.GLOBAL_NAMESPACE) {
            const namespaceSocket = this.connectNamespace(namespace);
            if (namespaceSocket) {
                namespaceSocket.emit(eventName, { room: this.room, ...payload });
            }
        }
    }

    listenForMessages(namespace: string, eventName: string): Observable<unknown> {
        const namespaceSocket = this.connectNamespace(namespace);
        return new Observable((observer) => {
            const messageHandler = (message: unknown) => observer.next(message);
            namespaceSocket.on(eventName, messageHandler);
        });
    }

    private connectNamespace(namespace: string): Socket {
        const namespaceSocket = this.io.io(`${this.url}/${namespace}`);
        this.namespaces.set(namespace, namespaceSocket);
        return namespaceSocket;
    }
}
