import { Game, Player } from './game';
import { BarChartQuestionStats } from './game-stats';
export interface GameSession {
    pin: string;
    game: Game;
    players: Player[];
    statisticsData: BarChartQuestionStats[];
}
