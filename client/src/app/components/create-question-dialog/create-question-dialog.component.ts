import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Question } from '@app/interfaces/game-elements';
import { multipleOfTenValidator } from './validator-multiple10';

const MIN_CHOICES = 2;
const MAX_CHOICES = 4;
const MIN_POINTS = 10;
const MAX_POINTS = 100;

@Component({
    selector: 'app-create-question-dialog',
    templateUrl: './create-question-dialog.component.html',
    styleUrls: ['./create-question-dialog.component.scss'],
})
export class CreateQuestionDialogComponent {
    questionForm: FormGroup;
    question: Question;

    constructor(
        private fb: FormBuilder,
        @Inject(MatDialogRef) private dialogRef: MatDialogRef<CreateQuestionDialogComponent>,
    ) {
        this.questionForm = this.fb.group({
            type: ['', Validators.required],
            text: ['', Validators.required],
            points: ['', [Validators.required, Validators.min(MIN_POINTS), Validators.max(MAX_POINTS), multipleOfTenValidator]],
            choices: this.fb.array([], Validators.minLength(MIN_CHOICES)),
            answer: [''],
        });

        this.handleQuestionTypeChanges();
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }
    handleQuestionTypeChanges(): void {
        this.questionForm.get('type')?.valueChanges.subscribe((value) => {
            if (value === 'QCM') {
                this.questionForm.setControl('choices', this.fb.array([], Validators.minLength(MIN_CHOICES)));
            } else {
                this.choices.clear();
                this.questionForm.removeControl('choices');
            }
        });
    }

    addChoice(): void {
        if (this.choices.length < MAX_CHOICES) {
            this.choices.push(
                this.fb.group({
                    text: ['', Validators.required],
                    isCorrect: [false],
                }),
            );
        }
    }

    removeChoice(index: number): void {
        this.choices.removeAt(index);
    }

    onSubmit(): void {
        if (this.questionForm.valid) {
            this.question = this.questionForm.value;
            this.dialogRef.close(this.question);
        }
    }
}
