import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player, Game, Question } from '@common/game';
import { SocketsService } from '@app/services/sockets.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { map, filter } from 'rxjs/operators';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
    game: Game;
    players: Player[] = [];
    chatMessages: string[] = [];
    statisticsData: unknown[] = [];
    currentHistogramIndex: number = 0;

    constructor(
        private socketsService: SocketsService,
        private socketRoomService: SocketRoomService,
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
        if (this.currentHistogramIndex < this.game.questions.length - 1) {
            this.currentHistogramIndex++;
        }
    }

    showPreviousHistogram(): void {
        if (this.currentHistogramIndex > 0) {
            this.currentHistogramIndex--;
        }
    }

    calculateBarWidth(numberAnswered: number): string {
        const maxNumberAnswered = this.getMaxNumberAnswered();
        if (maxNumberAnswered === 0) {
            return '0%';
        }
        const percentage = (numberAnswered / maxNumberAnswered) * 100;
        return percentage + '%';
    }

    getMaxNumberAnswered(): number {
        const currentQuestion: Question = this.game.questions[this.currentHistogramIndex];
        const maxNumberAnswered = currentQuestion.choices.reduce((max, choice) => {
            return Math.max(max, choice.numberAnswered);
        }, 0);
        return maxNumberAnswered;
    }

    private connectToServer(): void {
        // Rejoindre la room et écouter les événements nécessaires
        const namespace = 'yourNamespace';
        const room = 'O';
        this.socketsService.joinRoom(namespace, room);

        // Écouter les informations des joueurs
        this.socketsService
            .listenForMessages(namespace, 'playerInfo')
            .pipe(
                filter((data): data is Player[] => Array.isArray(data) && data.every((item) => 'name' in item && 'score' in item)),
                map((data) => data as Player[]),
            )
            .subscribe((players: Player[]) => {
                this.players = players;
                this.sortPlayers();
            });

        // Écouter les QCMSTATS
        this.socketsService.listenForMessages(namespace, 'QCMSTATS').subscribe((stats) => {
            this.statisticsData.push(stats);
        });

        // Écouter les messages du chat
        this.socketRoomService.getChatMessages().subscribe((message: string) => {
            this.chatMessages.push(message);
        });
    }
}
