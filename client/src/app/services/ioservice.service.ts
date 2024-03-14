import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
@Injectable({
    providedIn: 'root',
})
export class IoService {
    io(url: string) {
        return io(url);
    }
}
