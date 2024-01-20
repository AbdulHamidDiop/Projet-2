import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-create-question-dialog',
    templateUrl: './create-question-dialog.component.html',
    styleUrls: ['./create-question-dialog.component.scss'],
})
export class CreateQuestionDialogComponent {
    questionForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.questionForm = this.fb.group({
            questionType: ['QCM', Validators.required],
            question: ['', Validators.required],
            points: ['', Validators.required],
            answers: this.fb.array([], Validators.minLength(2)),
        });
    }

    get answers() {
        return this.questionForm.get('answers') as FormArray;
    }

    addAnswer() {
        if (this.answers.length < 4) {
            this.answers.push(
                this.fb.group({
                    answer: ['', Validators.required],
                    isCorrect: [false],
                }),
            );
        }
    }

    removeAnswer(index: number) {
        this.answers.removeAt(index);
    }

    onSubmit() {}
}
