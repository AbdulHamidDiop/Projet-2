import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set game players', () => {
        const players = [
            { name: 'player1', isHost: false, id: '1', score: 0, bonusCount: 0 },
            { name: 'player2', isHost: false, id: '2', score: 0, bonusCount: 0 },
        ];
        service.setGamePlayers(players);
        expect(service.playersInGame).toEqual(players);
    });
});
