import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Question } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { ChatMessage } from '@common/message';
import { Player } from '@common/player';
import { Events, Namespaces } from '@common/sockets';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
    game: Game;
    players: Player[] = [];
    chatMessages: string[] = [];
    statisticsData: QCMStats[] = [];
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

    getBarChartData(): void {
        // const currentQuestion: Question = this.game.questions[this.currentHistogramIndex];
        // for (const choice of currentQuestion.choices) {
        //     this.statisticsData.push({ data: [choice.numberAnswered], label: choice.text });
        // }
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
        if (this.currentHistogramIndex < this.game.questions.length - 1) {
            this.currentHistogramIndex++;
        }
    }

    showPreviousHistogram(): void {
        if (this.currentHistogramIndex > 0) {
            this.currentHistogramIndex--;
        }
    }
    getMaxNumberAnswered(): number {
        const currentQuestion: Question = this.game.questions[this.currentHistogramIndex];
        const maxNumberAnswered = currentQuestion.choices.reduce((max, choice) => {
            return Math.max(max, 0);
        }, 0);
        return maxNumberAnswered;
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
        this.socketsService.joinRoom('0');
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
        this.socketsService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe({
            next: (stats: unknown) => {
                console.log(stats);
                this.statisticsData.push(stats as QCMStats);
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
