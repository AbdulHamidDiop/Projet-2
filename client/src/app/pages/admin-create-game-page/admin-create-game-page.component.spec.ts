import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminQuestionComponent } from '@app/components/admin-question/admin-question.component';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { Game, Question, Type } from '@common/game';
import { Observable, of } from 'rxjs';
import { AdminCreateGamePageComponent } from './admin-create-game-page.component';

const validQuestion: Question = {
    id: '2',
    lastModification: null,
    type: Type.QCM,
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

const observableQuestion: Observable<Question[]> = new Observable((subscriber) => {
    subscriber.next([validQuestion]);
});

let openCallCount = 0;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function openCallCountFunction() {
    openCallCount++;
    return { afterClosed: () => observableQuestion };
}

/* let moveItemInArrayCount = 0;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function countMoveItemInArray() {
    moveItemInArrayCount++;
}*/

describe('AdminCreateGamePageComponent', () => {
    let component: AdminCreateGamePageComponent;
    let fixture: ComponentFixture<AdminCreateGamePageComponent>;

    const validGame: Game = {
        id: '0',
        lastModification: new Date(),
        title: 'Jeu standard',
        description: 'Description valide',
        duration: 10,
        questions: [
            {
                id: '2',
                type: Type.QCM,
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
                lastModification: null,
                answer: 'Choix #1',
            },
            {
                id: '1',
                type: Type.QCM,
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
                lastModification: null,
                answer: 'Choix #1',
            },
            {
                id: '0',
                type: Type.QCM,
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
                lastModification: null,
                answer: 'Choix #1',
            },
            {
                id: '3',
                type: Type.QCM,
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
                lastModification: null,
                answer: 'Choix #1',
            },
        ],
    };
    const observableGame: Observable<Game[]> = new Observable((subscriber) => {
        subscriber.next([validGame]);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppMaterialModule,
                BrowserAnimationsModule,
                AppRoutingModule,
                FormsModule,
                DragDropModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
            ],
            declarations: [AdminCreateGamePageComponent, AdminQuestionsBankComponent, AdminQuestionComponent],
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getGameById: jasmine.createSpy('getGameById').and.returnValue(observableGame),
                        addGame: jasmine.createSpy('addGame').and.callThrough(),
                    },
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open: jasmine.createSpy('open').and.callFake(openCallCountFunction),
                    },
                },
                {
                    provide: CommunicationService,
                },
                {
                    provide: HttpClient,
                },
                {
                    provide: GameService,
                    useValue: {
                        addGame: jasmine.createSpy('addGame').and.returnValue(() => {
                            of();
                        }),
                    },
                },
                /*
                {
                    provide: AdminQuestionsBankComponent,
                    useValue: {
                        questionsBankList: jasmine.createSpy('questionsBankList').and.callThrough(),
                    },
                },*/
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminCreateGamePageComponent);
        fixture = TestBed.createComponent(AdminCreateGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const moveItemInArraySpy = jasmine.createSpy('moveItemInArray');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should create new question game, copy relevant fields from form input', () => {
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();

        expect(component.game.title === game.title).toBeTruthy();
        expect(component.game.description === game.description).toBeTruthy();
        expect(component.game.duration === game.duration).toBeTruthy();
        let deepCopyCheck = true;
        for (let i = 0; i < game.questions.length; i++) {
            if (
                game.questions[i].text !== component.game.questions[i].text ||
                game.questions[i].type !== component.game.questions[i].type ||
                game.questions[i].points !== component.game.questions[i].points ||
                game.questions[i].answer !== component.game.questions[i].answer
            ) {
                deepCopyCheck = false;
                break;
            }

            if (game.questions[i].type === Type.QCM) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const choices: any = game.questions[i].choices;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const componentChoices: any = component.game.questions[i].choices;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < choices.length; j++) {
                    if (choices.text !== componentChoices.text) {
                        deepCopyCheck = false;
                        break;
                    }
                }
            }
        }
        expect(deepCopyCheck).toBeTruthy();
    });

    it('Should let user type a name and game description', () => {
        const game: Game = { ...validGame };
        component.populateForm(game);
        component.saveQuiz();

        expect(component.game.title === game.title).toBeTruthy();
        expect(component.game.description === game.description).toBeTruthy();
    });

    it('Should validate game name and game description as not empty', () => {
        let game: Game = { ...validGame };
        game.title = '';
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = { ...validGame };
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();

        game = { ...validGame };
        game.description = '';
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();
    });

    it('Should let user pick a time interval between 10 and 60 seconds inclusively', () => {
        let game: Game = { ...validGame };
        game.duration = 9;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = { ...validGame };
        game.duration = 10;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();

        game = { ...validGame };
        game.duration = 61;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = { ...validGame };
        game.duration = 60;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();
    });

    // À régler si possible
    it('Should let user change the order of questions by calling moveItemInArray', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    it('Should let user transfer questions from question bank by calling transferItemInArray', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const question1 = validQuestion;
        const question2 = validQuestion;
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
    it('Should call CreateQuestionDialogComponent to create question', () => {
        openCallCount = 0;
        component.openDialog();
        expect(openCallCount).toBe(1);
    });

    /*
    it('Should display questions in a numbered list by increasing order', () => {
        expect(component).toBeTruthy();
    });
    it('Should call', () => {
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
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();
        expect(component.game.visible).toBeFalsy();
    });
    it('Should save data in a persistent manner even after a complete reboot of website and dynamic server ( 100% server-side )', () => {
        expect(component).toBeTruthy();
    });*/
});
