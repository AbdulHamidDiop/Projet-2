import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketRoomService } from '@app/services/socket-room.service';
import { BarChartChoiceStats, BarChartQuestionStats } from '@common/game-stats';
import { ChatMessage } from '@common/message';
import { Player } from '@common/player';
import { Events, Namespaces } from '@common/sockets';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
    players: Player[] = [];
    chatMessages: string[] = [];
    statisticsData: BarChartQuestionStats[] = [];
    currentHistogramData: BarChartChoiceStats[] = [];
    currentHistogramIndex: number = 0;

    constructor(
        private socketsService: SocketRoomService,
        public router: Router,
    ) {}

    ngOnInit(): void {
        this.statisticsData = [];
        this.currentHistogramIndex = 0;
        this.chatMessages = ['Message 1', 'Message 2', 'Message 3'];
        this.connectToServer();
    }

    sortPlayers(): void {
        this.players.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }

    returnToInitialView(): void {
        this.router.navigate(['/home']);
    }

    showNextHistogram(): void {
        if (this.currentHistogramIndex < this.statisticsData.length - 1) {
            this.currentHistogramIndex++;
            console.log(this.statisticsData[this.currentHistogramIndex].data);
            this.updateChart();
        }
    }

    showPreviousHistogram(): void {
        if (this.currentHistogramIndex > 0) {
            this.currentHistogramIndex--;
            console.log(this.statisticsData[this.currentHistogramIndex].data);
            this.updateChart();
        }
    }

    private updateChart(): void {
        this.currentHistogramData = this.statisticsData[this.currentHistogramIndex].data;
    }

    // private updateChoiceCounts(data: { room: string; questionId: string; choiceAmount: number; choiceIndex: number; selected: boolean }): void {
    //     const key = `${data.questionId}`;
    //     if (key) {
    //         if (!this.choiceCounts[key]) {
    //             this.choiceCounts[key] = new Array(data.choiceAmount).fill(0);
    //         }
    //         if (data.selected) {
    //             this.choiceCounts[key][data.choiceIndex] = (this.choiceCounts[key][data.choiceIndex] || 0) + 1;
    //         } else {
    //             this.choiceCounts[key][data.choiceIndex] = (this.choiceCounts[key][data.choiceIndex] || 0) - 1;
    //         }
    //     }
    // }

    private connectToServer(): void {
        // this.socketsService
        // .listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS)
        // .pipe(
        //     filter((data): data is Player[] => Array.isArray(data) && data.every((item) => 'name' in item && 'score' in item)),
        //     map((data) => data as Player[]),
        // )
        // .subscribe((players: Player[]) => {
        //     this.players = players;
        //     this.sortPlayers();
        // });
        // Écouter les QCMSTATS
        this.socketsService.listenForMessages(Namespaces.GAME_STATS, Events.GAME_RESULTS).subscribe({
            next: (stats: unknown) => {
                const statsObj = stats as { [key: string]: BarChartQuestionStats };
                const statisticsData: BarChartQuestionStats[] = [];
                for (const key in statsObj) {
                    if (!isNaN(Number(key))) {
                        statisticsData.push(statsObj[key]);
                    }
                }
                this.statisticsData = statisticsData;
                this.currentHistogramData = this.statisticsData[this.currentHistogramIndex].data;
                console.log(this.statisticsData);
            },
            error: (error) => {
                console.error('Error receiving QCM_STATS:', error);
            },
        });

        this.socketsService.getChatMessages().subscribe((message: ChatMessage) => {
            this.chatMessages.push(message.message);
        });
    }
}
