import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Question } from '@app/interfaces/game-elements';
import { AppMaterialModule } from '@app/modules/material.module';
import { CreateQuestionDialogComponent } from './create-question-dialog.component';

describe('CreateQuestionDialogComponent', () => {
    let component: CreateQuestionDialogComponent;
    let fixture: ComponentFixture<CreateQuestionDialogComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const emptyQuestion: Question = {
        id: '',
        type: 'QCM',
        text: '',
        points: 10,
        choices: [
            {
                text: '',
                isCorrect: true,
            },
            {
                text: '',
                isCorrect: false,
            },
            {
                text: '',
                isCorrect: false,
            },
            {
                text: '',
                isCorrect: false,
            },
        ],
        answer: '',
    };
    const validQuestion: Question = {
        id: '1',
        type: 'QCM',
        text: 'Question valide',
        points: 10,
        choices: [
            {
                text: 'Choix valide #1',
                isCorrect: true,
            },
            {
                text: 'Choix valide #2',
                isCorrect: false,
            },
            {
                text: 'Choix valide #3',
                isCorrect: false,
            },
            {
                text: 'Choix valide #4',
                isCorrect: false,
            },
        ],
        answer: 'Choix #1',
    };

    beforeEach(async () => {
        const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['onNoClick', 'closeDialog', 'type']);

        TestBed.configureTestingModule({
            declarations: [CreateQuestionDialogComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: matDialogSpy,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: emptyQuestion,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should let user create 2 to 4 answers to each question', () => {
        let question = validQuestion;
        component.populateForm(question);
        expect(component.question.id === question.id).toBeTruthy();
        expect(component.question.text === question.text).toBeTruthy();
        expect(component.question.points === question.points).toBeTruthy();
        expect(component.question.type === question.type).toBeTruthy();
        expect(component.question.answer === question.answer).toBeTruthy();
        expect(component.question.choices.length === question.choices.length).toBeTruthy();
        let answersEqual = true;
        for (let i = 0; i < question.choices.length; i++) {
            if (
                question.choices[i].text === component.question.choices[i].text &&
                question.choices[i].isCorrect === component.question.choices[i].isCorrect
            )
                continue;
            else {
                answersEqual = false;
                break;
            }
        }
        expect(answersEqual).toBeTruthy();

        question = validQuestion;
        question.choices.push({ text: 'Choix #5, en trop', isCorrect: false });
        component.populateForm(question);
        expect(component.question.choices.length !== question.choices.length).toBeTruthy();
        answersEqual = true;
        for (let i = 0; i < question.choices.length; i++) {
            if (
                question.choices[i].text === component.question.choices[i].text &&
                question.choices[i].isCorrect === component.question.choices[i].isCorrect
            )
                continue;
            else {
                answersEqual = false;
                break;
            }
        }
        expect(!answersEqual).toBeTruthy();

        question = validQuestion;
        while (question.choices.length > 2) {
            question.choices.pop();
        }
        component.populateForm(question);
        expect(component.question.choices.length !== question.choices.length).toBeTruthy();
        answersEqual = true;
        for (let i = 0; i < question.choices.length; i++) {
            if (
                question.choices[i].text === component.question.choices[i].text &&
                question.choices[i].isCorrect === component.question.choices[i].isCorrect
            )
                continue;
            else {
                answersEqual = false;
                break;
            }
        }
        expect(!answersEqual).toBeTruthy();
    });
    it('Should let user define if an answer is correct or wrong', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user delete and modify an answer choice', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user change the order of questions by updating their number id', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user create one or multiple questions', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user write score associated to each question,the score must in interval [10,100], the score must also be a multiple of 10', () => {
        expect(component).toBeTruthy();
    });
    it('Should display questions in a numbered list by increasing order', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user delete or modify an existing question', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user change the order of questions in the list', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user add questions from question bank', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user save question in question bank', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user modify existing question-game', () => {
        expect(component).toBeTruthy();
    });
    it('Should update existing game information after successful save ( check if request is sent )', () => {
        expect(component).toBeTruthy();
    });
    it('Should create new game if game was deleted by another user while it was being modified ( 100% server-side )', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user save a game', () => {
        expect(component).toBeTruthy();
    });
    it('Should validate a game before saving it with at least one valid question', () => {
        expect(component).toBeTruthy();
    });
    it('Should notify user in case of missing fields in game or its questions', () => {
        expect(component).toBeTruthy();
    });
    it('Should save questions and answers in specified numerical order', () => {
        expect(component).toBeTruthy();
    });
    it('Should save a game with visibility parameter set to hidden at the end of the existing game list', () => {
        expect(component).toBeTruthy();
    });
});
