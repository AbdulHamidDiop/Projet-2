import { Game } from './game';
import { BarChartQuestionStats } from './game-stats';
export interface GameSession {
    pin: string;
    game: Game;
    statisticsData: BarChartQuestionStats[];
}
