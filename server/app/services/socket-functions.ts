import { Socket } from 'socket.io';
import { SocketEvents } from './socket-events.service';
export class SocketFunctions {
    makeRoomId(): string {
        const digits = '123456789';
        const ID_LENGTH = 4;
        const indices: number[] = [];
        for (let i = 0; i < ID_LENGTH; i++) {
            const index = Math.floor(Math.random() * digits.length);
            indices.push(index);
        }
        let id = '';
        for (let i = 0; i < ID_LENGTH; i++) {
            id = id.concat(digits[indices[i]]);
        }
        return id;
    }
    socketInRoom(socket: Socket, context: SocketEvents): boolean {
        return context.socketIdRoom.get(socket.id) !== undefined && context.playerSocketId.get(socket.id) !== undefined;
    }
    roomCreated(socket: Socket, context: SocketEvents): boolean {
        const room = context.socketIdRoom.get(socket.id);
        return context.liveRooms.includes(room) && context.mapOfPlayersInRoom.has(room);
    }
}
