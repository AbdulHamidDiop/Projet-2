import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { QuestionsService } from '@app/services/questions.service';
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
    @Output() saveRequest = new EventEmitter<Question>();
    @Output() deleteRequest = new EventEmitter<number>();

    constructor(
        public dialog: MatDialog,
        private questionsService: QuestionsService,
        private router: Router,
    ) {}

    openDialog(): void {
        const questionData: Question = this.question ? this.question : ({} as Question);
        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {
            data: { question: questionData },
        });

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.question = result;
                this.questionsService.editQuestion(this.question);
                this.saveRequest.emit(this.question);
            }
        });
    }

    deleteQuestion(question: Question): void {
        if (this.router.url === '/admin/questions') {
            this.questionsService.deleteQuestion(question);
        }
        this.deleteRequest.emit(this.index);
    }
}
