import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { Question } from '@common/game';

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent {
    constructor(private http: HttpClient, private communicationService: CommunicationService, private router: Router) {}
    questions: Question[];
    isAuthentificated: boolean;

    getQuestions() {
        this.http.get("http://localhost:3000/api/admin/questions")
            .subscribe((response: any) => {
              this.questions = response;
            });
    }

    ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        this.getQuestions();
    }

    onModifyButtonClick() {
        //link to create question but with arguments
    }

    onDeleteButtonClick(question: Question) {
        this.http.delete(`http://localhost:3000/api/admin/questions/deletequestion/${question.id}`)
        .subscribe((response: any) => {});
        this.questions = this.questions.filter((q) => q !== question);
    }
}
