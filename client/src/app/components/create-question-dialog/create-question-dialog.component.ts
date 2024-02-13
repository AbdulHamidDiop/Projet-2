import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionsService } from '@app/services/questions.service';
import { Choices, Question, Type } from '@common/game';
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

    // eslint-disable-next-line max-params
    constructor(
        public fb: FormBuilder,
        public dialogRef: MatDialogRef<CreateQuestionDialogComponent>,
        public questionsService: QuestionsService,
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
            if (value === Type.QCM) {
                this.questionForm.setControl(
                    'choices',
                    this.fb.array([], [Validators.minLength(MIN_CHOICES), Validators.maxLength(MAX_CHOICES), hasIncorrectAndCorrectAnswer]),
                );
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
                this.questionsService.addQuestion(this.question);
            }
        }
    }

    initializeForm(): void {
        this.questionForm = this.fb.group({
            type: ['', Validators.required],
            text: ['', Validators.required],
            points: ['', [Validators.required, Validators.min(MIN_POINTS), Validators.max(MAX_POINTS), multipleOfTenValidator]],
            choices: this.fb.array([], [Validators.minLength(MIN_CHOICES), Validators.maxLength(MAX_CHOICES), hasIncorrectAndCorrectAnswer]),
            addToBank: [false],
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    populateForm(questionData: Question): void {
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
