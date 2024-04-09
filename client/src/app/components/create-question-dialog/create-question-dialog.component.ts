import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuestionsService } from '@app/services/questions.service';
import { Choices, Question, Type } from '@common/game';
import { v4 } from 'uuid';
import { MAX_CHOICES, MAX_POINTS, MIN_CHOICES, MIN_POINTS } from './const';
import { hasIncorrectAndCorrectAnswer, multipleOfTenValidator } from './validator-functions';

@Component({
    selector: 'app-create-question-dialog',
    templateUrl: './create-question-dialog.component.html',
    styleUrls: ['./create-question-dialog.component.scss'],
})
export class CreateQuestionDialogComponent implements OnInit {
    questionForm: FormGroup;
    question: Question;
    id: string;
    hideAddToBankOption = false;

    // On a besoin de toutes ces injections qui sont notamment des élèments d'Angular.
    // eslint-disable-next-line max-params
    constructor(
        public formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<CreateQuestionDialogComponent>,
        public questionsService: QuestionsService,
        public router: Router,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.initializeForm();
        this.handleQuestionTypeChanges(); // pour negliger choices si type = QRL
        if (this.router.url === '/admin/questions') {
            this.hideAddToBankOption = true;
        }
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }
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
                    this.formBuilder.array([], [Validators.minLength(MIN_CHOICES), Validators.maxLength(MAX_CHOICES), hasIncorrectAndCorrectAnswer]),
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
                this.formBuilder.group({
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

    async onSubmit(): Promise<void> {
        if (!this.questionForm.valid) return;

        this.question = {
            ...this.questionForm.value,
            id: this.id,
            lastModification: new Date(),
        };

        const addToBank = this.questionForm.get('addToBank')?.value || this.hideAddToBankOption;
        if (addToBank) {
            await this.questionsService.addQuestion(this.question);
        }

        this.dialogRef.close(this.question);
    }

    initializeForm(): void {
        this.questionForm = this.formBuilder.group({
            type: ['', Validators.required],
            text: ['', Validators.required],
            points: ['', [Validators.required, Validators.min(MIN_POINTS), Validators.max(MAX_POINTS), multipleOfTenValidator]],
            choices: this.formBuilder.array([], [Validators.minLength(MIN_CHOICES), Validators.maxLength(MAX_CHOICES), hasIncorrectAndCorrectAnswer]),
            addToBank: [false],
        });
    }

    populateForm(questionData: Question): void {
        this.questionForm.patchValue({
            type: questionData.type,
            text: questionData.text,
            points: questionData.points,
        });

        const choicesArray = this.questionForm.get('choices') as FormArray;
        if (questionData.choices) {
            questionData.choices.forEach((choice) => {
                choicesArray.push(this.createChoiceFormGroup(choice));
            });
        }
    }

    private createChoiceFormGroup(choice: Choices): FormGroup {
        return this.formBuilder.group({
            text: [choice.text, Validators.required],
            isCorrect: [choice.isCorrect],
        });
    }
}
