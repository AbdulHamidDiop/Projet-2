import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { AdminQuestionsBankComponent } from './admin-questions-bank.component';

describe('AdminQuestionsBankComponent', () => {
    let component: AdminQuestionsBankComponent;
    let fixture: ComponentFixture<AdminQuestionsBankComponent>;
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
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    async function getAllQuestionsMock(): Promise<Question[]> {
        return [validQuestion];
    }
    const getQuestionsSpy = jasmine.createSpy('getAllQuestions').and.callFake(getAllQuestionsMock);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            declarations: [AdminQuestionsBankComponent],
            providers: [
                {
                    provide: QuestionsService,
                    useValue: {
                        getAllQuestions: getQuestionsSpy,
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(AdminQuestionsBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should call questionsService.getAllQuestions in constructor', async () => {
        getAllQuestionsMock().then(() => {
            expect(getQuestionsSpy).toHaveBeenCalled();
        });
    });

    it('Should let user change the order of questions by calling moveItemInArray on a drag and drop event', () => {
        const question1 = { ...validQuestion };
        const question2 = { ...validQuestion };
        question1.text = 'Question 1';
        question2.text = 'Question 2';
        component.questionsBankList.data = [question1, question2];
        expect(component.questionsBankList.data[0].text).toBe('Question 1');
        expect(component.questionsBankList.data[1].text).toBe('Question 2');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            container: component.questionsBankList,
            previousIndex: 0,
            currentIndex: 1,
            previousContainer: component.questionsBankList,
        };
        component.dropQuestion(event);
        expect(component.questionsBankList.data[0].text).toBe('Question 2');
        expect(component.questionsBankList.data[1].text).toBe('Question 1');
    });

    it('Should let user transfer questions from questions area by calling transferItemInArray on a drag and drop event', () => {
        const question1 = { ...validQuestion };
        const question2 = { ...validQuestion };
        question1.text = 'Question 1';
        question2.text = 'Question 2';
        component.questionsBankList.data = [question1];
        expect(component.questionsBankList.data.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            container: component.questionsBankList,
            previousIndex: 0,
            currentIndex: 1,
            previousContainer: { data: [question2] },
        };
        component.dropQuestion(event);
        expect(component.questionsBankList.data.length).toBe(2);
    });

    it('Should sort questions by last modification date', () => {
        const question1 = { ...validQuestion };
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        question1.lastModification = new Date(2024, 3);
        question1.id = '1';
        const question2 = { ...validQuestion };
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        question2.lastModification = new Date(2024, 2);
        question2.id = '2';
        const question3 = { ...validQuestion };
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        question3.lastModification = new Date(2024, 1);
        question3.id = '3';
        component.questions = [question3, question2, question1];
        component.updateDisplayQuestions();
        expect(component.questions[0].id).toBe('1');
        expect(component.questions[1].id).toBe('2');
        expect(component.questions[2].id).toBe('3');
    });

    it('Should call questionsService.getAllQuestions when pressing button to reload questions', async () => {
        getQuestionsSpy.calls.reset();
        component.reloadQuestions();
        getAllQuestionsMock().then(() => {
            expect(getQuestionsSpy).toHaveBeenCalled();
        });
    });

    it('Should let user change type of question being viewed by pressing the toggle question type buttons', () => {
        const question1 = { ...validQuestion };
        question1.type = Type.QRL;
        const question2 = { ...validQuestion };
        question2.type = Type.QRL;
        const question3 = { ...validQuestion };
        question3.type = Type.QCM;

        component.questions = [question1, question2, question3];
        component.toggleQuestionType(Type.QCM);
        expect(component.displayQuestions.length).toBe(1);
        expect(component.displayQuestions[0].type).toBe(Type.QCM);

        component.toggleQuestionType(Type.QRL);
        expect(component.displayQuestions.length).toBe(2);
        expect(component.displayQuestions[0].type).toBe(Type.QRL);
        expect(component.displayQuestions[1].type).toBe(Type.QRL);

        // Should not change variables in case of incorrect question type.
        component.toggleQuestionType('');
        expect(component.displayQuestions.length).toBe(2);
        expect(component.displayQuestions[0].type).toBe(Type.QRL);
        expect(component.displayQuestions[1].type).toBe(Type.QRL);
    });
});
