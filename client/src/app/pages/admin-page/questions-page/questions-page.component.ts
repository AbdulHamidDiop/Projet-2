import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { Question } from '@common/game';

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent {
    questions: Question[];
    isAuthentificated: boolean;

    constructor(
        private communicationService: CommunicationService,
        private router: Router,
        private questionsService: QuestionsService,
    ) {}

    async getQuestions() {
        this.questions = await this.questionsService.getAllQuestions();
    }

    async ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        await this.getQuestions();
        this.questionsService.deleteRequest.subscribe(() => {
            this.getQuestions();
        });
    }
}
