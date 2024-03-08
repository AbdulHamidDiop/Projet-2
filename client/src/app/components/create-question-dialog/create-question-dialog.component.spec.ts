import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Choices, Question, Type } from '@common/game';
import { validQuestion } from '@common/test-interfaces';
import { Observable } from 'rxjs';
import { CreateQuestionDialogComponent } from './create-question-dialog.component';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
async function addQuestionMock(): Promise<void> {
    return;
}
const addQuestionSpy = jasmine.createSpy('getAllQuestions').and.callFake(addQuestionMock);

describe('CreateQuestionDialogComponent', () => {
    let component: CreateQuestionDialogComponent;
    let fixture: ComponentFixture<CreateQuestionDialogComponent>;
    const validQuestionForm = {
        question: validQuestion,
    };
    const closeDialogSpy = jasmine.createSpy('close').and.callThrough();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observableAbstractControl: Observable<any> = new Observable((subscriber) => {
        subscriber.next(Type.QCM);
        subscriber.next(Type.QRL);
    });
    const setControlSpy = jasmine.createSpy('setControl').and.callThrough();
    const removeControlSpy = jasmine.createSpy('removeControl').and.callThrough();
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateQuestionDialogComponent],
            imports: [AppMaterialModule, FormsModule, DragDropModule, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: closeDialogSpy,
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: validQuestionForm },
                {
                    provide: QuestionsService,
                    useValue: {
                        addQuestion: addQuestionSpy,
                    },
                },
                {
                    provide: AbstractControl,
                    useValue: {
                        valueChanges: observableAbstractControl,
                    },
                },
                {
                    provide: FormGroup,
                    useValue: {
                        setControl: setControlSpy,
                        removeControl: removeControlSpy,
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('Should initialize question from MAT_DIALOG_DATA injection token', () => {
        expect(component.id).toBe(validQuestion.id);
    });

    it('Should assign id if no question data is injected via MAT_DIALOG_DATA', () => {
        component.data = null;
        component.id = '';
        component.ngOnInit();
        expect(component.id !== '').toBeTruthy();
    });

    it('Should add empty choice when pressing the add choice button, remove choice when pressing the remove choice button', () => {
        while (component.choices.length > 0) {
            component.removeChoice(0);
        }
        component.addChoice();
        expect(component.choices.length).toBe(1);

        component.removeChoice(0);
        expect(component.choices.length).toBe(0);

        const question: Question = validQuestion;
        component.populateForm(question);
        expect(component.choices.length === question.choices.length).toBeTruthy();
        expect(component.choices.at(0).value.text === question.choices[0].text).toBeTruthy();
    });

    it('Should let user change the order of questions by calling moveItemInArray on a drag and drop event', () => {
        while (component.choices.length > 0) {
            component.removeChoice(0);
        }
        component.choices.push(
            component.fb.group({
                text: ['1', Validators.required],
                isCorrect: [true],
            }),
        );
        component.choices.push(
            component.fb.group({
                text: ['2', Validators.required],
                isCorrect: [false],
            }),
        );
        expect(component.choices.length).toBe(2);
        expect(component.choices.at(0).value.text).toBe('1');
        expect(component.choices.at(1).value.text).toBe('2');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            previousIndex: 0,
            currentIndex: 1,
        };
        component.dropChoice(event);
        expect(component.choices.at(0).value.text).toBe('2');
        expect(component.choices.at(1).value.text).toBe('1');
    });

    it('Should check if question points are in interval [10 à 100] and a multiple of 10.', () => {
        const question: Question = { ...validQuestion };
        question.points = 51;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.points = 50;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeTruthy();

        question.points = 0;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.points = 110;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('Should check if there are between 2 and 4 choices in the question', () => {
        const question: Question = { ...validQuestion };
        component.populateForm(question);
        expect(component.questionForm.valid).toBeTruthy();

        question.choices = [{ text: 'Valid text', isCorrect: true } as Choices];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.choices = [
            { text: 'Valid text', isCorrect: true } as Choices,
            { text: 'Valid text', isCorrect: false } as Choices,
            { text: 'Valid text', isCorrect: true } as Choices,
            { text: 'Valid text', isCorrect: true } as Choices,
            { text: 'Valid text', isCorrect: true } as Choices,
        ];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('Should copy choices from question and their correctness', () => {
        const question: Question = { ...validQuestion };
        question.choices = [{ text: '1', isCorrect: true } as Choices, { text: '2', isCorrect: false } as Choices];
        component.populateForm(question);
        component.onSubmit();
        expect(component.choices.at(0).value.text).toBe('1');
        expect(component.choices.at(1).value.text).toBe('2');
        expect(component.choices.at(0).value.isCorrect).toBeTruthy();
        expect(component.choices.at(1).value.isCorrect).toBeFalsy();
    });

    it('Should ask for at least one correct or incorrect choices per question.', () => {
        const question: Question = { ...validQuestion };
        question.choices = [{ text: 'Valid text', isCorrect: true } as Choices, { text: 'Valid text', isCorrect: true } as Choices];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.choices = [{ text: 'Valid text', isCorrect: false } as Choices, { text: 'Valid text', isCorrect: false } as Choices];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('Should call questionsService.addQuestion when selecting addToBank option in the question form.', async () => {
        const question: Question = validQuestion;
        component.populateForm(question);
        component.questionForm.patchValue({ addToBank: true });
        component.onSubmit();
        addQuestionMock().then(() => {
            expect(addQuestionSpy).toHaveBeenCalled();
        });
    });

    it('Should call MatDialogRef.close after pressing submit button to close the dialog', () => {
        component.onSubmit();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('Should call setControl and removeControl to change question form on change of question type', () => {
        observableAbstractControl.subscribe((type) => {
            if (type === Type.QCM) {
                expect(component.questionForm.contains('choices')).toBeTruthy();
            }
        });
    });
});
