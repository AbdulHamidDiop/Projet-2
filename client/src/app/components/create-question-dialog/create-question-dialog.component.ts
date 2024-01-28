import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Choices, Question } from '@app/interfaces/game-elements';
import { v4 } from 'uuid';
import { hasIncorrectAndCorrectAnswer, multipleOfTenValidator } from './validator-functions';

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
    id: string;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CreateQuestionDialogComponent>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.initializeForm();
        this.handleQuestionTypeChanges(); // pour negliger choices si type = QRL
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        if (this.data && this.data.question) {
            this.populateForm(this.data.question);
            this.id = this.data.question.id;
        } else {
            this.id = v4(); // nouveau id
        }
    }

    handleQuestionTypeChanges(): void {
        this.questionForm.get('type')?.valueChanges.subscribe((value) => {
            if (value === 'QCM') {
                this.questionForm.setControl('choices', this.fb.array([], [Validators.minLength(MIN_CHOICES), hasIncorrectAndCorrectAnswer]));
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

    dropChoice(event: CdkDragDrop<Choices[]>) {
        const choicesArray = this.choices.getRawValue();
        moveItemInArray(choicesArray, event.previousIndex, event.currentIndex);
        this.choices.setValue(choicesArray);
    }

    onSubmit(): void {
        if (this.questionForm.valid) {
            this.question = this.questionForm.value;
            this.question.id = this.id;
            this.question.lastModification = new Date();
            this.dialogRef.close(this.question);

            if (this.questionForm.get('addToBank')?.value) {
                // TODO: add question to bank
                console.log('add question to bank');
            }
        }
    }

    private initializeForm(): void {
        this.questionForm = this.fb.group({
            type: ['', Validators.required],
            text: ['', Validators.required],
            points: ['', [Validators.required, Validators.min(MIN_POINTS), Validators.max(MAX_POINTS), multipleOfTenValidator]],
            choices: this.fb.array([], [Validators.minLength(MIN_CHOICES), hasIncorrectAndCorrectAnswer]),
            addToBank: [false],
        });
    }

    private populateForm(questionData: Question): void {
        this.questionForm.patchValue({
            type: questionData.type,
            text: questionData.text,
            points: questionData.points,
        });

        if (questionData.choices) {
            const choicesArray = this.questionForm.get('choices') as FormArray;
            questionData.choices.forEach((choice) => {
                choicesArray.push(
                    this.fb.group({
                        text: [choice.text, Validators.required],
                        isCorrect: [choice.isCorrect],
                    }),
                );
            });
        }
    }
}
