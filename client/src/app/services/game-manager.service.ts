import { Injectable, OnDestroy } from '@angular/core';
import { Feedback } from '@common/feedback';
import { Game, Player, Question } from '@common/game';
import { Events, Namespaces } from '@common/sockets';
import { Observable, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';
import { GameSessionService } from './game-session.service';
import { SocketRoomService } from './socket-room.service';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService implements OnDestroy {
    game: Game;
    gamePin: string;
    currentQuestionIndex: number = 0;
    endGame: boolean = false;
    inRandomMode: boolean = false;
    playersInRandomGame: Player[] = [];
    lastPlayerThatConfirmed: string = '';
    numberOfAnswers: number = 0;
    nextQuestionSignal$: Observable<void>;

    private nextQuestionSignal: Subject<void>;
    private playerLeftSubscription: Subscription;
    private answerConfirmationSubscription: Subscription;

    constructor(
        private gameSessionService: GameSessionService,
        private fetchService: FetchService,
        private socketService: SocketRoomService,
    ) {}

    async initialize(pin: string) {
        this.gamePin = pin;
        const game = await this.gameSessionService.getGameWithoutCorrectShown(pin);
        if (game) {
            this.game = game;
        }
    }

    initRandomGame(players: Player[]) {
        this.playersInRandomGame = players;
        this.inRandomMode = true;
        this.nextQuestionSignal = new Subject<void>();
        this.nextQuestionSignal$ = this.nextQuestionSignal.asObservable();

        this.playerLeftSubscription = this.socketService.listenForMessages(Namespaces.GAME, Events.PLAYER_LEFT).subscribe((data: unknown) => {
            const username = (data as { user: string }).user;
            this.playersInRandomGame = this.playersInRandomGame.filter((player) => player.name !== username);
        });

        this.answerConfirmationSubscription = this.socketService
            .listenForMessages(Namespaces.GAME_STATS, Events.CONFIRM_ANSWER_R)
            .subscribe((data: unknown) => {
                const payload = data as { room: string; player: Player };
                const username = payload.player.name;

                if (this.lastPlayerThatConfirmed === username) {
                    return;
                }
                if (++this.numberOfAnswers === this.playersInRandomGame.length + 1) {
                    this.numberOfAnswers = 0;
                    this.lastPlayerThatConfirmed = '';
                    this.nextQuestionSignal.next();
                }
                this.lastPlayerThatConfirmed = username;
            });
    }
    reset() {
        this.currentQuestionIndex = 0;
        this.endGame = false;
    }

    firstQuestion(): Question {
        if (this.game && this.game.questions[0]) {
            return this.game.questions[0];
        }
        return {} as Question;
    }

    goNextQuestion(): Question {
        this.numberOfAnswers = 0;
        this.lastPlayerThatConfirmed = '';

        if (this.game) {
            if (this.currentQuestionIndex + 1 === this.game.questions.length) {
                this.endGame = true;
                return this.game.questions[this.currentQuestionIndex];
            } else {
                return this.game.questions[++this.currentQuestionIndex];
            }
        }
        return {} as Question;
    }

    onLastQuestion(): boolean {
        if (this.game) {
            return this.currentQuestionIndex === this.game.questions.length - 1;
        }
        return false;
    }

    async isCorrectAnswer(answer: string[], questionID: string): Promise<boolean> {
        return await this.gameSessionService.checkAnswer(answer, this.gamePin, questionID);
    }

    async getFeedBack(questionId: string, answer: string[]): Promise<Feedback[]> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'gameSession/feedback', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionPin: this.gamePin, questionID: questionId, submittedAnswers: answer }),
        });
        const feedback = await response.json();
        return feedback;
    }

    ngOnDestroy() {
        this.playerLeftSubscription?.unsubscribe();
        this.answerConfirmationSubscription?.unsubscribe();
    }
}
