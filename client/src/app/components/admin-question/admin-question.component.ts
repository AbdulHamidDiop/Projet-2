import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { Question } from '@common/game';

@Component({
    selector: 'app-admin-question',
    templateUrl: './admin-question.component.html',
    styleUrls: ['./admin-question.component.scss'],
})
export class AdminQuestionComponent {
    @Input() question: Question;
    @Input() index?: number;
    @Input() editable?: boolean = false;
    @Output() deleteRequest = new EventEmitter<Question>();
    @Output() saveRequest = new EventEmitter<Question>();

    constructor(
        public dialog: MatDialog,
        private http: HttpClient,
    ) {}

    openDialog(): void {
        const questionData: Question = this.question ? this.question : ({} as Question);

        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {
            data: { question: questionData },
        });

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.question = result;
                this.saveRequest.emit(this.question);
            }
        });
    }

    deleteQuestion(question: Question): void {
        this.http.delete(`http://localhost:3000/api/questions/deletequestion/${question.id}`).subscribe(() => {
            this.deleteRequest.emit(question);
        });
    }
}
