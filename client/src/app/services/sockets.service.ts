import { Injectable } from '@angular/core';
import { SOCKET_URL } from '@common/consts';
import { Events, Namespaces } from '@common/sockets';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketsService {
    private baseUrl: string = SOCKET_URL;
    private namespaces: Map<string, Socket> = new Map();
    private baseSocket: Socket = io(this.baseUrl);

    constructor() {
        this.baseSocket.emit('joinRoom', { room: '0' });
    }

    joinRoom(namespace: string, room: string): void {
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
            this.baseSocket.emit(eventName, { room, ...payload });
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

    private connectNamespace(namespace: string): Socket | undefined {
        if (!this.namespaces.has(namespace)) {
            const namespaceSocket = io(`${this.baseUrl}/${namespace}`);
            this.namespaces.set(namespace, namespaceSocket);
        }
        return this.namespaces.get(namespace);
    }
}
