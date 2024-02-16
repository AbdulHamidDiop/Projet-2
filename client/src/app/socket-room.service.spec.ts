import { TestBed } from '@angular/core/testing';

import { SocketRoomService } from './socket-room.service';

describe('SocketRoomService', () => {
    let service: SocketRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
