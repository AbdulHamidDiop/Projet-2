import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { CreateQuestionDialogComponent } from './create-question-dialog.component';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
async function addQuestionMock(): Promise<void> {
    return;
}
const addQuestionSpy = jasmine.createSpy('getAllQuestions').and.callFake(addQuestionMock);

describe('CreateQuestionDialogComponent', () => {
    let component: CreateQuestionDialogComponent;
    let fixture: ComponentFixture<CreateQuestionDialogComponent>;
    const validQuestion: Question = {
        id: '2',
        type: Type.QCM,
        text: 'Question valide',
        points: 10,
        lastModification: null,
        choices: [
            {
                text: 'Choix valide #1',
                isCorrect: true,
            },
            {
                text: 'Choix valide #2',
                isCorrect: false,
            },
        ],
        answer: 'Choix #1',
    };
    const validQuestionForm = {
        question: validQuestion,
    };
    const closeDialogSpy = jasmine.createSpy('close').and.callThrough();

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
                } /*
                {
                    provide: FormGroup,
                    useValue: {
                        get: jasmine
                            .createSpy('get')
                            .withArgs('type')
                            .and.returnValue(Type.QCM)
                            .withArgs('addToBank')
                            .and.returnValue(true)
                            .withArgs('choices')
                            .and.returnValue({}),
                        setControl: jasmine.createSpy('setControl'),
                        removeControl: jasmine.createSpy('removeControl'),
                        patchValue: jasmine.createSpy('patchValue'),
                    },
                },
                {
                    provide: FormArray,
                    useValue: {
                        clear: jasmine.createSpy('clear'),
                    },
                },*/,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    //     it('should create', () => {
    //         expect(component).toBeTruthy();
    //     });

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

        question.choices = [{ text: 'Valid text', isCorrect: true }];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.choices = [
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: false },
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: true },
        ];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('Should copy choices from question and their correctness', () => {
        const question: Question = { ...validQuestion };
        question.choices = [
            { text: '1', isCorrect: true },
            { text: '2', isCorrect: false },
        ];
        component.populateForm(question);
        component.onSubmit();
        expect(component.choices.at(0).value.text).toBe('1');
        expect(component.choices.at(1).value.text).toBe('2');
        expect(component.choices.at(0).value.isCorrect).toBeTruthy();
        expect(component.choices.at(1).value.isCorrect).toBeFalsy();
    });

    it('Should ask for at least one correct or incorrect choices per question.', () => {
        const question: Question = { ...validQuestion };
        question.choices = [
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: true },
        ];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question.choices = [
            { text: 'Valid text', isCorrect: false },
            { text: 'Valid text', isCorrect: false },
        ];
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
});
