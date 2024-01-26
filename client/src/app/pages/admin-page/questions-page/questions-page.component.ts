import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Question } from '@common/game';

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent {
    constructor(private http: HttpClient) {}
    questions: Question[];

    getQuestions() {
        this.http.get("http://localhost:3000/api/admin/questions")
            .subscribe((response: any) => {
              this.questions = response;
            });
    }

    ngOnInit() {
        this.getQuestions();
    }

    onModifyButtonClick() {
        //link to create question but with arguments
    }

    onDeleteButtonClick(question: Question) {
        this.http.delete(`http://localhost:3000/api/admin/questions/deletequestion/${question.id}`)
        .subscribe((response: any) => {});
    }
}
