import { Game, Player } from './game';
import { BarChartQuestionStats } from './game-stats';
export interface GameSession {
    pin: string;
    game: Game;
    isCompleted: boolean;
    nbPlayers?: number;
    timeStarted?: Date;
    bestScore?: number;
    players: Player[];
    statisticsData: BarChartQuestionStats[];
}
