import { TestBed } from '@angular/core/testing';

import { Player } from '@common/game';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let player1: Player;
    let player2: Player;
    let player3: Player;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerService);
        player1 = {
            name: 'Player1',
            isHost: false,
            id: '',
            score: 100,
            bonusCount: 0,
        };
        player2 = {
            name: 'Player2',
            isHost: false,
            id: '',
            score: 150,
            bonusCount: 0,
        };
        player3 = {
            name: 'Player3',
            isHost: false,
            id: '',
            score: 80,
            bonusCount: 0,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set game players', () => {
        service.setGamePlayers([player1, player2]);
        expect(service.playersInGame).toEqual([player1, player2]);
    });

    it('should add a game player', () => {
        service.setGamePlayers([player1, player2]);
        service.addGamePlayers(player3);
        expect(service.playersInGame).toEqual([player1, player2, player3]);
    });

    it('should update existing game player', () => {
        service.setGamePlayers([player1, player2, player3]);
        const updatedPlayer: Player = {
            name: 'Player2',
            isHost: false,
            id: '',
            score: 200,
            bonusCount: 0,
        };
        service.addGamePlayers(updatedPlayer);
        expect(service.playersInGame).toEqual([player1, updatedPlayer, player3]);
    });

    it('should reset game players', () => {
        service.setGamePlayers([player1, player2]);
        service.resetGamePlayers();
        expect(service.playersInGame).toEqual([]);
    });

    it('should find the best score', () => {
        service.setGamePlayers([player1, player2, player3]);
        const bestScore = service.findBestScore();
        expect(bestScore).toBe(150);
        const players = [
            { name: 'player1', isHost: false, id: '1', score: 0, bonusCount: 0 },
            { name: 'player2', isHost: false, id: '2', score: 0, bonusCount: 0 },
        ];
        service.setGamePlayers(players);
        expect(service.playersInGame).toEqual(players);
    });
});
