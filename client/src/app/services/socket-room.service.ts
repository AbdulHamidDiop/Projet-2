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
    private chatMessageSocket: Socket;
    private createGameSocket: Socket;
    private waitingRoomSocket: Socket;
    private gameSocket: Socket;
    private url = 'http://localhost:3000'; // Your Socket.IO server URL
    private room: string = '0';

    constructor() {
        this.socket = io(this.url);
        this.chatMessageSocket = io(this.url + '/' + Namespaces.CHAT_MESSAGES);
        this.createGameSocket = io(this.url + '/' + Namespaces.CREATE_GAME);
        this.waitingRoomSocket = io(this.url + '/' + Namespaces.WAITING_ROOM);
        this.gameSocket = io(this.url + '/' + Namespaces.GAME);

        alert(this.chatMessageSocket.id);
        alert(this.createGameSocket.id);
        alert(this.waitingRoomSocket.id);
        alert(this.gameSocket.id);
    }

    get connected() {
        return this.socket.connected;
    }

    createRoom(gameId: string) {
        this.socket.emit('createRoom', { id: gameId });
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

    kickPlayer(name: string, player: string) {
        this.socket.emit(Events.KICK_PLAYER, { name, player });
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getPlayers(): Observable<Player[]> {
        this.socket.emit(Events.GET_PLAYERS, this.room);
        return new Observable((observer) => {
            this.socket.on(Events.GET_PLAYERS, (players) => {
                observer.next(players);
            });
            return () => this.socket.off(Events.GET_PLAYERS);
        });
    }

    getProfile(): Observable<Player> {
        this.socket.emit(Events.GET_PLAYER_PROFILE);
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

    sendChatMessage(message: string) {
        const room = this.room;
        const messageFix: ChatMessage = { message, author: 'User', timeStamp: '' };
        this.chatMessageSocket.emit(Events.CHAT_MESSAGE, { room, messageFix });
    }

    getChatMessages(): Observable<string> {
        return new Observable((observer) => {
            this.chatMessageSocket.on(Events.CHAT_MESSAGE, (message) => {
                observer.next(message.message);
            });
            return () => this.chatMessageSocket.off(Events.CHAT_MESSAGE);
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
}
