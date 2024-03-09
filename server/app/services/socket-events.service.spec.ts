import { expect } from 'chai';
import { SocketEvents } from './socket-events.service';

describe('Date Service', () => {
    let socketEvents: SocketEvents;
    beforeEach(() => {
        socketEvents = new SocketEvents();
    });

    it('Should create', () => {
        expect(socketEvents).to.equal(true);
    });
});
