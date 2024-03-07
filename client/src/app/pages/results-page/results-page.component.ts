import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { SocketRoomService } from '@app/services/socket-room.service';
// import { SocketsService } from '@app/services/sockets.service';
import { Game, Question } from '@common/game';
import { Player } from '@common/player';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
    game: Game;
    players: Player[] = [];
    chatMessages: string[] = [];
    statisticsData: { data: number[]; label: string }[] = [];
    currentHistogramIndex: number = 0;

    constructor(
        // private socketsService: SocketsService,
        // private socketRoomService: SocketRoomService,
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

    private connectToServer(): void {
        // Rejoindre la room et écouter les événements nécessaires
        // const namespace = 'yourNamespace';
        // const room = 'O';
        // this.socketsService.joinRoom(namespace, room);
        // Écouter les informations des joueurs
        // this.socketsService
        // .listenForMessages(namespace, 'playerInfo')
        // .pipe(
        //     filter((data): data is Player[] => Array.isArray(data) && data.every((item) => 'name' in item && 'score' in item)),
        //     map((data) => data as Player[]),
        // )
        // .subscribe((players: Player[]) => {
        //     this.players = players;
        //     this.sortPlayers();
        // });
        // // Écouter les QCMSTATS
        // this.socketsService.listenForMessages(namespace, 'QCMSTATS').subscribe((stats) => {
        //     this.statisticsData.push(stats);
        // });
        // Écouter les messages du chat
        // this.socketRoomService.getChatMessages().subscribe((message: string) => {
        //     this.chatMessages.push(message);
        // });
    }
}
