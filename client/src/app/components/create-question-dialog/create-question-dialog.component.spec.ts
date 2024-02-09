import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppModule } from '@app/app.module';
import { Choices, Question } from '@app/interfaces/game-elements';
import { QuestionsBankService } from '@app/services/questions-bank.service';
import { CreateQuestionDialogComponent } from './create-question-dialog.component';

let addQuestionCalled = false;

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function setAddQuestionsCalled() {
    addQuestionCalled = true;
}

describe('CreateQuestionDialogComponent', () => {
    let component: CreateQuestionDialogComponent;
    let fixture: ComponentFixture<CreateQuestionDialogComponent>;
    const validQuestion: Question = {
        id: '2',
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
        ],
        answer: 'Choix #1',
    };
    const validQuestionForm = {
        question: validQuestion,
    };

    beforeEach(async () => {
        // const matDialogRefSpy = jasmine.createSpyObj(MatDialogRef, ['close']);
        await TestBed.configureTestingModule({
            declarations: [CreateQuestionDialogComponent],
            imports: [AppModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: jasmine.createSpy('close'),
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: validQuestionForm },
                {
                    provide: QuestionsBankService,
                    useValue: {
                        addQuestion: jasmine.createSpy('addQuestion').and.callFake(setAddQuestionsCalled),
                    },
                },
                /*
                {
                    provide: FormGroup,
                    useValue: {
                        get: jasmine
                            .createSpy('get')
                            .withArgs('type')
                            .and.returnValue('QCM')
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
                },*/
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

    it('Should be able to call a function', () => {
        component.populateForm(validQuestion);
        component.onSubmit();
        expect(component.question.id === validQuestion.id).toBeTruthy();
    });

    it('Le système doit permettre la suppression et modification d un choix de réponse', () => {
        // const choice: Choices = { text: '', isCorrect: false };
        const nbChoices = component.choices.length;
        component.addChoice();
        expect(component.choices.length === nbChoices + 1).toBeTruthy();

        component.removeChoice(0);
        expect(component.choices.length === nbChoices).toBeTruthy();

        const question: Question = validQuestion;
        component.populateForm(question);
        expect(component.choices.length === question.choices.length).toBeTruthy();
        expect(component.choices.at(0).value.text === question.choices[0].text).toBeTruthy();
    });

    it('Le système doit permettre le changement d ordre des choix en mettant à jour leur numération.', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            previousIndex: 0,
            currentIndex: 1,
        };
        const choices: Choices[] = [
            { text: '1', isCorrect: true },
            { text: '2', isCorrect: false },
        ];
        while (component.choices.length > 0) {
            component.removeChoice(0);
        }
        component.choices.push(
            component.fb.group({
                text: [choices[0].text, Validators.required],
                isCorrect: [choices[0].isCorrect],
            }),
        );
        component.choices.push(
            component.fb.group({
                text: [choices[1].text, Validators.required],
                isCorrect: [choices[1].isCorrect],
            }),
        );
        expect(component.choices.length === 2).toBeTruthy();
        component.dropChoice(event);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const choice: Choices | any = component.choices.at(0);
        expect(choice.value.text === '2').toBeTruthy();
    });

    it('Le système doit permettre la saisie des points pour une bonne réponse : intervalle [10 à 100] et un multiple de 10.', () => {
        const question: Question = validQuestion;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeTruthy();

        question.points = 51;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        component.populateForm(validQuestion); // Remets valid à true

        question.points = 0;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        component.populateForm(validQuestion); // Remets valid à true

        question.points = 110;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('Le système doit permettre la création de 2 à 4 choix de réponse pour chaque question.', () => {
        //      const lowerBound = 2;
        //      const upperBound = 4;
        let question: Question = validQuestion;
        component.populateForm(question);
        expect(component.questionForm.valid).toBeTruthy();

        question = validQuestion;
        question.choices = [{ text: 'Valid text', isCorrect: true }];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();

        question = validQuestion;
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

    it('Le système doit permettre de définir si un choix de réponse est considéré comme bon ou mauvais', () => {
        const question: Question = validQuestion;
        question.choices = [
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: false },
        ];
        component.populateForm(question);
        component.onSubmit();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(component.choices.at(0).value.isCorrect).toBeTruthy();
        expect(component.choices.at(1).value.isCorrect).toBeFalsy();
    });

    it('Le système doit exiger au moins un bon et un mauvais choix de réponse par question.', () => {
        const question: Question = validQuestion;
        question.choices = [
            { text: 'Valid text', isCorrect: true },
            { text: 'Valid text', isCorrect: true },
        ];
        component.populateForm(question);
        expect(component.questionForm.valid).toBeFalsy();
    });

    it("Le système doit permettre la sauvegarde d'une question dans la banque de questions", () => {
        const question: Question = validQuestion;
        component.populateForm(question);
        component.questionForm.patchValue({ addToBank: true });
        component.onSubmit();
        expect(addQuestionCalled).toBeTruthy();
    });
});
