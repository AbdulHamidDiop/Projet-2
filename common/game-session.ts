import { Game } from './game';
export interface GameSession {
    pin: string;
    game: Game;
    isCompleted: boolean;
    nbPlayers?: number;
    timeStarted?: Date;
    bestScore?: number;
}
