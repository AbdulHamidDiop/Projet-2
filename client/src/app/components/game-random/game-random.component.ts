import { Component } from '@angular/core';
import { QuestionsService } from '@app/services/questions.service';
import { Question } from '@common/game';

const NUMBER_RANDOM_QUESTIONS = 5;

@Component({
    selector: 'app-game-random',
    templateUrl: './game-random.component.html',
    styleUrls: ['./game-random.component.scss'],
})
export class GameRandomComponent {
    show: boolean = false;
    questions: Question[];

    constructor(private questionService: QuestionsService) {
        this.setQuestions();
    }

    launchGame(): void {
        console.log(this.selectRandomQuestions());
    }

    private setQuestions(): void {
        // Get all QCM necessaires ou filter QLR
        this.questionService.getAllQuestions().then((questions) => {
            if (questions.length >= NUMBER_RANDOM_QUESTIONS) {
                this.questions = questions;
                this.show = true;
            }
        });
    }
    private shuffleQuestions(): void {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    private selectRandomQuestions(): Question[] {
        this.shuffleQuestions();
        return this.questions.slice(0, NUMBER_RANDOM_QUESTIONS);
    }
}
