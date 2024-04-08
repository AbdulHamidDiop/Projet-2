/* eslint-disable max-lines */
import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';
import { Game, Player, Question, RED } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { ChatMessage, SystemMessages } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { IoService } from './ioservice.service';

@Injectable({
    providedIn: 'root',
})
// On peut ajouter des nouvelles fonctionnalités selon les besoins des components.
export class SocketRoomService implements OnDestroy {
    room: string;
    unitTests: boolean = false;
    showingResults: boolean = false;
    readonly socket: Socket;
    readonly namespaces: Map<string, Socket> = new Map();

    // Si l'on met ces paramètres dans dans un service séparé, la complexité du code augmente.
    // eslint-disable-next-line max-params
    constructor(
        private io: IoService,
        public playerService: PlayerService,
        private router: Router,
        private snackBar: MatSnackBar, // Peut-être mettre dans un component.
    ) {
        this.socket = io.io(environment.ws);
        window.addEventListener('beforeunload', () => {
            if (!this.showingResults) {
                this.endGame('La partie a été interrompue');
            }
        });
        this.listenForMessages(Namespaces.GAME, Events.ABORT_GAME).subscribe(() => {
            this.endGame();
        });
    }

    get connected() {
        return this.socket.connected;
    }

    confirmAnswer(player: Player) {
        this.sendMessage(Events.CONFIRM_ANSWERS, Namespaces.GAME_STATS, { player });
    }

    excludeFromChat(player: Player) {
        this.socket.emit(Events.EXCLUDE_FROM_CHAT, { player });
    }

    includeInChat(player: Player) {
        this.socket.emit(Events.INCLUDE_IN_CHAT, { player });
    }

    abandonGame() {
        this.socket.emit(Events.ABANDON_GAME);
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

    getGamePin(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on(Events.GET_GAME_PIN, (pin) => {
                observer.next(pin);
            });
        });
    }

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

    onNameNotAvailable(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.NAME_NOT_AVAILABLE, () => {
                observer.next();
            });
        });
    }

    onNameBanned(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.BANNED_NAME, () => {
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

    startRandomGame(): void {
        this.socket.emit(Events.START_RANDOM_GAME);
    }

    gameStartSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.START_GAME, () => {
                observer.next();
            });
        });
    }

    randomGameStartSubscribe(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on(Events.START_RANDOM_GAME, () => {
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
        window.removeEventListener('beforeunload', this.endGame.bind(this, 'La partie a été interrompue'));
    }

    endGame(snckMessage?: string): void {
        const snackMessage = snckMessage ? snckMessage : 'La partie a été interrompue';

        if (this.playerService.player.name === 'Organisateur') {
            this.sendMessage(Events.CLEANUP_GAME, Namespaces.GAME);
            this.sendMessage(Events.ABORT_GAME, Namespaces.GAME);
            if (!this.unitTests) {
                this.router.navigate(['/createGame']);
            }
        } else if (this.room) {
            this.snackBar.open(snackMessage, 'Fermer', {
                duration: 5000,
                verticalPosition: 'top',
            });
            if (!this.unitTests) {
                // this.router.navigate(['/home'], { queryParams: { init: true } });
                this.router.navigate(['/createGame']);
            }
            const message: ChatMessage = {
                author: SystemMessages.AUTHOR,
                message: this.playerService.player.name + ' ' + SystemMessages.PLAYER_LEFT,
                timeStamp: new Date().toLocaleTimeString(),
            };
            this.sendChatMessage(message);
            this.sendMessage(Events.PLAYER_LEFT, Namespaces.GAME, { user: this.playerService.player.name });
        }
        //   this.leaveRoom(); Fait bug une fonctionnalité, si l'appel à leaveroom est necessaire
        // faudra un nouvel event ex. leaveGame.
        this.resetGameState();
    }

    resetGameState(): void {
        this.room = '';
        this.showingResults = false;
        this.playerService.playersInGame = [];
        this.playerService.player = {
            name: '',
            isHost: false,
            id: '',
            score: 0,
            bonusCount: 0,
            color: RED,
            chatEnabled: true,
            outOfRoom: false,
        };
    }

    connectNamespace(namespace: string): Socket | undefined {
        if (!this.namespaces.has(namespace)) {
            const namespaceSocket = this.io.io(`${environment.ws}/${namespace}`);
            this.namespaces.set(namespace, namespaceSocket);
        }
        return this.namespaces.get(namespace);
    }
}
