import { Component } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { QuestionsService } from '@app/services/questions.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Game, Question } from '@common/game';

const NUMBER_RANDOM_QUESTIONS = 5;

@Component({
    selector: 'app-game-random',
    templateUrl: './game-random.component.html',
    styleUrls: ['./game-random.component.scss'],
})
export class GameRandomComponent {
    show: boolean = false;
    questions: Question[];
    game: Game;

    constructor(
        private questionService: QuestionsService,
        private socket: SocketRoomService,
        private playerService: PlayerService,
    ) {
        this.setQuestions();
    }

    launchGame(): void {
        this.socket.leaveRoom();
        this.playerService.player.isHost = true;
        this.playerService.player.name = 'Organisateur';
        this.socket.createRoom(this.game);
    }

    private setQuestions(): void {
        // Get all QCM depuis service ou filtrer QLR
        this.questionService.getAllQuestions().then((questions) => {
            if (questions.length >= NUMBER_RANDOM_QUESTIONS) {
                this.questions = questions.filter((question) => question.type === 'QCM');
                this.show = true;
                this.game = this.createGame();
            }
        });
    }
    private createGame(): Game {
        return {
            id: crypto.randomUUID() + 'aleatoire',
            title: 'Mode Aléatoire',
            questions: this.selectRandomQuestions(),
            duration: 20,
        };
    }

    private selectRandomQuestions(): Question[] {
        this.shuffleQuestions();
        return this.questions.slice(0, NUMBER_RANDOM_QUESTIONS);
    }

    private shuffleQuestions(): void {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
}
