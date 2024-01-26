import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { Game, Question } from '@app/interfaces/game-elements';

const MIN_DURATION = 10;
const MAX_DURATION = 60;
@Component({
    selector: 'app-admin-create-game-page',
    templateUrl: './admin-create-game-page.component.html',
    styleUrls: ['./admin-create-game-page.component.scss'],
})
export class AdminCreateGamePageComponent {
    @ViewChild(AdminQuestionsBankComponent) questionsBankComponent!: AdminQuestionsBankComponent;
    questionsBankList!: CdkDropList;

    gameForm: FormGroup;
    game: Game;
    questions: Question[] = [];

    constructor(
        public dialog: MatDialog,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef, // to avoid ExpressionChangedAfterItHasBeenCheckedError
    ) {}

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngAfterViewInit(): void {
        // Access the cdkDropList from the child component after view initialization
        this.questionsBankList = this.questionsBankComponent.questionsBankList;
        this.cd.detectChanges();
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        this.gameForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            duration: [null, [Validators.required, Validators.min(MIN_DURATION), Validators.max(MAX_DURATION)]],
        });
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {});

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.questions.push(result);
            }
        });
    }

    dropQuestion(event: CdkDragDrop<Question[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    saveQuiz(): void {
        this.game = {
            id: '0',
            lastModification: new Date(),
            title: this.gameForm.value.title,
            description: this.gameForm.value.description,
            duration: this.gameForm.value.duration,
            questions: this.questions,
        };

        console.log(this.game);
    }
}
