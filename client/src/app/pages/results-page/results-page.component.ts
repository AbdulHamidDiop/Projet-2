import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionService } from '@app/services/game-session.service';
import { Game } from '@app/services/game.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { BarChartChoiceStats, BarChartQuestionStats } from '@common/game-stats';
import { ChatMessage, SystemMessages } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';
const COMPLETE_DELAY = 5000;
@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit, OnDestroy {
    game: Game;
    statisticsData: BarChartQuestionStats[] = [];
    currentHistogramData: BarChartChoiceStats[] = [];
    currentHistogramIndex: number = 0;
    players: Player[] = [];

    private routeSubscription: Subscription;
    private playersSubscription: Subscription;
    private gameResultsSubscription: Subscription;

    // On a besoin de ces injections pour le bon fonctionnement de la page, sans nuire à la complexité du code
    // eslint-disable-next-line max-params
    constructor(
        private socketsService: SocketRoomService,
        public playerService: PlayerService,
        private gameSessionService: GameSessionService,
        public router: Router,
    ) {}

    ngOnInit(): void {
        this.gameSessionService.getGameWithoutCorrectShown(this.socketsService.room).then((game) => {
            this.game = game;
        });
        this.connectToServer();
        window.addEventListener('popstate', this.onLocationChange);
        window.addEventListener('hashchange', this.onLocationChange);
    }

    sortPlayers(): void {
        this.playerService.playersInGame.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        this.players = this.playerService.playersInGame;
    }

    returnToInitialView(): void {
        this.leaveWithoutKickingPlayers();
    }

    showNextHistogram(): void {
        if (this.currentHistogramIndex < this.statisticsData.length - 1) {
            this.currentHistogramIndex++;
            this.updateChart();
        }
    }

    showPreviousHistogram(): void {
        if (this.currentHistogramIndex > 0) {
            this.currentHistogramIndex--;
            this.updateChart();
        }
    }

    onLocationChange(): void {
        this.leaveWithoutKickingPlayers();
    }

    ngOnDestroy(): void {
        window.removeEventListener('popstate', this.onLocationChange);
        window.removeEventListener('hashchange', this.onLocationChange);

        this.routeSubscription?.unsubscribe();
        this.playersSubscription?.unsubscribe();
        this.gameResultsSubscription?.unsubscribe();
        this.socketsService?.endGame();
    }

    leaveWithoutKickingPlayers() {
        if (this.playerService.player.name === 'Organisateur') {
            this.socketsService.sendMessage(Events.CLEANUP_GAME, Namespaces.GAME);
            const message: ChatMessage = {
                author: SystemMessages.AUTHOR,
                message: "L'organisateur" + ' ' + SystemMessages.PLAYER_LEFT,
                timeStamp: new Date().toLocaleTimeString(),
            };
            this.socketsService.sendChatMessage(message);
            this.socketsService.leaveRoom();
            this.socketsService.resetGameState();
            this.router.navigate(['/']);
        } else {
            this.socketsService.endGame('À la prochaine partie!');
        }
    }

    private updateChart(): void {
        this.currentHistogramData = this.statisticsData[this.currentHistogramIndex]?.data;
        this.socketsService.sendMessage(Events.UPDATE_CHART, Namespaces.GAME_STATS);
    }

    private connectToServer(): void {
        this.playersSubscription = this.socketsService.listenForMessages(Namespaces.GAME_STATS, Events.GET_FINAL_PLAYERS).subscribe(async (data) => {
            const players = data as Player[];
            this.playerService.playersInGame = players;
            this.sortPlayers();
        });

        // Écouter les QCMSTATS
        this.gameResultsSubscription = this.socketsService.listenForMessages(Namespaces.GAME_STATS, Events.GET_STATS).subscribe({
            next: (stats: unknown) => {
                const statsObj = stats as { [key: string]: BarChartQuestionStats };
                const statisticsData: BarChartQuestionStats[] = [];
                for (const key in statsObj) {
                    if (!isNaN(Number(key))) {
                        statisticsData.push(statsObj[key]);
                    }
                }
                this.statisticsData = statisticsData;
                this.currentHistogramData = this.statisticsData[this.currentHistogramIndex]?.data;
            },
        });
        this.socketsService.sendMessage(Events.GET_FINAL_PLAYERS, Namespaces.GAME_STATS);
        this.socketsService.sendMessage(Events.GET_STATS, Namespaces.GAME_STATS);
        setTimeout(async () => {
            await this.gameSessionService.completeSession(this.socketsService.room, this.playerService.findBestScore());
        }, COMPLETE_DELAY);
    }
}
