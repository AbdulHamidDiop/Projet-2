import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { Game, Question } from '@app/interfaces/game-elements';

@Component({
    selector: 'app-admin-create-game-page',
    templateUrl: './admin-create-game-page.component.html',
    styleUrls: ['./admin-create-game-page.component.scss'],
})
export class AdminCreateGamePageComponent {
    gameForm: FormGroup;
    game: Game;
    questions: Question[] = [];

    constructor(
        public dialog: MatDialog,
        private fb: FormBuilder,
    ) {}

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        this.gameForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            duration: [null, Validators.required],
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
