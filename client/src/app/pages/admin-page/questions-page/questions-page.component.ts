import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent {
    constructor(private http: HttpClient) {}
    questions: any[];

    getQuestions() {
        this.http.get("http://localhost:3000/api/admin/questions")
            .subscribe((response: any) => {
              this.questions = response;
            });
    }

    ngOnInit() {
        this.getQuestions();
    }
}
