import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
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
        private dialog: MatDialog,
        private questionsService: QuestionsService,
        private router: Router,
    ) {}

    openDialog(): void {
        const questionData: Question = this.question ? this.question : ({} as Question);
<<<<<<< HEAD
        this.question.type = Type.QCM;
=======
>>>>>>> b3339ce74aedd2b734627e4e3f5e4cce434b7ace
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
