import { Component } from '@angular/core';
import { Player, Game, Question } from '@common/game';
import { PlayerService } from '@app/services/player.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent {
    game: Game;
    players: Player[] = [];
    chatMessages: string[] = [];
    statisticsData: unknown[] = [];
    currentHistogramIndex: number = 0;

    constructor(
        private playerService: PlayerService,
        public router: Router,
    ) {
        this.players = this.playerService.getAllPlayers();
        this.sortPlayers();
        this.chatMessages = ['Message 1', 'Message 2', 'Message 3'];
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

    // Méthode pour revenir à la vue initiale
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

    // Fonction pour calculer la largeur de la barre en pourcentage
    calculateBarWidth(numberAnswered: number): string {
        const maxNumberAnswered = this.getMaxNumberAnswered();
        if (maxNumberAnswered === 0) {
            return '0%';
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const percentage = (numberAnswered / maxNumberAnswered) * 100;
        return percentage + '%';
    }

    // Fonction pour obtenir le nombre maximum de sélections parmi tous les choix de la question actuelle
    getMaxNumberAnswered(): number {
        const currentQuestion: Question = this.game.questions[this.currentHistogramIndex];
        const maxNumberAnswered = currentQuestion.choices.reduce((max, choice) => {
            return Math.max(max, choice.numberAnswered);
        }, 0);
        return maxNumberAnswered;
    }
}
