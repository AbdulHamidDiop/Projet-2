import { Injectable } from '@angular/core';
import { Player } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player = {
        name: '',
        isHost: false,
        id: '',
        score: 0,
        bonusCount: 0,
    };
}
