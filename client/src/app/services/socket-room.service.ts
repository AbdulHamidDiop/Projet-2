import { Injectable, OnDestroy } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { Game, Player, Question } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { IoService } from './ioservice.service';

@Injectable({
    providedIn: 'root',
})
// On peut ajouter des nouvelles fonctionnalités selon les besoins des components.
export class SocketRoomService implements OnDestroy {
    room: string;
    readonly socket: Socket;
    readonly url = 'http://localhost:3000'; // Your Socket.IO server URL
    readonly namespaces: Map<string, Socket> = new Map();

    constructor(
        private io: IoService,
        public playerService: PlayerService,
    ) {
        this.socket = io.io(this.url);
        window.addEventListener('beforeunload', this.handleUnload.bind(this));
    }

    get connected() {
        return this.socket.connected;
    }

    createRoom(game: Game) {
        this.socket.emit(Events.CREATE_ROOM, { game });
    }

    joinRoom(roomId: string) {
        this.socket.emit(Events.JOIN_ROOM, { room: roomId });
    }

    roomJoinSubscribe(): Observable<boolean> {
        return new Observable((observer) => {
            this.socket.on(Events.JOIN_ROOM, (res) => {
                observer.next(res);
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
            this.socket.on(Events.LOCK_ROOM, () => {
                observer.next();
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

    nameAvailable(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.NAME_NOT_AVAILABLE, () => {
                observer.next();
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
    requestPlayers(): void {
        this.socket.emit(Events.GET_PLAYERS);
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
        this.socket.emit(Events.SET_PLAYER_NAME, { name });
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
        this.sendMessage(Events.NEXT_QUESTION, Namespaces.GAME);
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

    async joinRoomInNamespace(namespace: string, room: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const namespaceSocket = this.connectNamespace(namespace);
            if (namespaceSocket) {
                namespaceSocket.emit(Events.JOIN_ROOM, { room }, (response: unknown) => {
                    if (response && (response as { success: boolean }).success) {
                        resolve();
                    } else {
                        reject(new Error('Failed to join room'));
                    }
                });
            } else {
                reject(new Error('Namespace socket is undefined'));
            }
        });
    }

    async joinAllNamespaces(room: string): Promise<void[]> {
        this.room = room;
        const promises = Object.values(Namespaces).map(async (namespace) => this.joinRoomInNamespace(namespace, room));
        return Promise.all(promises);
    }

    sendMessage(eventName: Events, namespace: Namespaces, payload?: object): void {
        if (namespace !== Namespaces.GLOBAL_NAMESPACE) {
            const namespaceSocket = this.connectNamespace(namespace);
            if (namespaceSocket) {
                const room = this.room;
                namespaceSocket.emit(eventName, { room, ...payload });
            }
        }
    }

    listenForMessages(namespace: string, eventName: string): Observable<unknown> {
        const namespaceSocket = this.connectNamespace(namespace);
        return new Observable((observer) => {
            if (namespaceSocket) {
                const messageHandler = (message: unknown) => observer.next(message);
                namespaceSocket.on(eventName, messageHandler);

                // Cleanup
                return () => {
                    namespaceSocket.off(eventName, messageHandler);
                };
            }
            return;
        });
    }

    getStats(): Observable<QCMStats> {
        return new Observable((observer) => {
            this.socket.on(Events.QCM_STATS, (stat) => {
                observer.next(stat);
            });
        });
    }

    ngOnDestroy() {
        window.removeEventListener('beforeunload', this.handleUnload.bind(this));
    }

    handleUnload(): void {
        if (this.playerService.player.name === 'Organisateur') {
            this.sendMessage(Events.CLEANUP_GAME, Namespaces.GAME);
            this.sendMessage(Events.ABORT_GAME, Namespaces.GAME);
        }
    }

    connectNamespace(namespace: string): Socket | undefined {
        if (!this.namespaces.has(namespace)) {
            const namespaceSocket = this.io.io(`${this.url}/${namespace}`);
            this.namespaces.set(namespace, namespaceSocket);
        }
        return this.namespaces.get(namespace);
    }
}
