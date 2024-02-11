import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AdminQuestionComponent } from '@app/components/admin-question/admin-question.component';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { Game, Question, Type } from '@common/game';
import { Observable } from 'rxjs';
import { AdminCreateGamePageComponent } from './admin-create-game-page.component';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
async function addGameMock(): Promise<void> {
    return;
}

describe('AdminCreateGamePageComponent', () => {
    let component: AdminCreateGamePageComponent;
    let fixture: ComponentFixture<AdminCreateGamePageComponent>;
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

    const openDialogSpy = jasmine.createSpy('open').and.callFake(() => {
        return { afterClosed: () => observableQuestion };
    });
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
    const getGameByIdSpy = jasmine.createSpy('getGameByID').and.returnValue(validGame);
    const addGameSpy = jasmine.createSpy('addGame').and.callFake(addGameMock);
    const observableParamMap: Observable<ParamMap> = new Observable((subscriber) => {
        subscriber.next();
    });
    const paramMapSpy = jasmine.createSpy('paramMap').and.returnValue(observableParamMap);
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
                        getGameByID: getGameByIdSpy,
                        addGame: addGameSpy,
                    },
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open: openDialogSpy,
                    },
                },
                {
                    provide: CommunicationService,
                },
                {
                    provide: HttpClient,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: {
                            subscribe: paramMapSpy,
                        },
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
    });
    it('Should create new question game, copy relevant fields from form input', () => {
        const game: Game = { ...validGame };
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
                const choices = game.questions[i].choices;
                const componentChoices = component.game.questions[i].choices;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < choices.length; j++) {
                    if (choices[j].text !== componentChoices[j].text) {
                        deepCopyCheck = false;
                        break;
                    }
                }
            }
        }
        expect(deepCopyCheck).toBeTruthy();
    });
    it('Should call gameService.addGame when pressing button to save quiz', async () => {
        addGameSpy.calls.reset();
        const game: Game = { ...validGame };
        component.populateForm(game);
        component.saveQuiz();
        addGameMock().then(() => {
            expect(addGameSpy).toHaveBeenCalled();
        });
    });
    it('Should validate game name as not empty', () => {
        const game: Game = { ...validGame };
        game.title = '';
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();
    });
    it('Should let user pick a time interval between 10 and 60 seconds inclusively', () => {
        const game: Game = { ...validGame };
        game.duration = 9;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game.duration = 10;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();

        game.duration = 61;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game.duration = 60;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();
    });
    it('Should let user change the order of questions by calling moveItemInArray', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const question1 = { ...validQuestion };
        const question2 = { ...validQuestion };
        question1.text = '1';
        question2.text = '2';
        component.questionsBankList.data = [question1, question2];
        expect(component.questionsBankList.data[0].text).toBe('1');
        expect(component.questionsBankList.data[1].text).toBe('2');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            container: component.questionsBankList,
            previousIndex: 0,
            currentIndex: 1,
            previousContainer: component.questionsBankList,
        };
        component.dropQuestion(event);
        expect(component.questionsBankList.data[0].text).toBe('2');
        expect(component.questionsBankList.data[1].text).toBe('1');
    });
    it('Should let user transfer questions from question bank by calling transferItemInArray', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const question1 = { ...validQuestion };
        const question2 = { ...validQuestion };
        question1.text = '1';
        question2.text = '2';
        component.questionsBankList.data = [question1];
        expect(component.questionsBankList.data.length).toBe(1);
        expect(component.questionsBankList.data[0].text).toBe('1');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = {
            container: component.questionsBankList,
            previousIndex: 0,
            currentIndex: 1,
            previousContainer: { data: [question2] },
        };
        component.dropQuestion(event);
        expect(component.questionsBankList.data.length).toBe(2);
        expect(component.questionsBankList.data[0].text).toBe('1');
        expect(component.questionsBankList.data[1].text).toBe('2');
    });
    it('Should call MatDialog.open to create question, opening CreateDialogComponent', () => {
        component.openDialog();
        expect(openDialogSpy).toHaveBeenCalled();
    });
    it('Should fetch question from CreateDialogComponent ', () => {
        component.questions = [];
        component.openDialog();
        observableQuestion.subscribe(() => {
            expect(component.questions.length).toBe(1);
        });
    });
    it('Should call gameService.getGameById on call to load game', () => {
        component.loadGameData('');
        expect(getGameByIdSpy).toHaveBeenCalled();
    });
    it('Should delete question on call to handleDeleteQuestion', () => {
        component.questions = [validQuestion];
        component.handleDeleteQuestion(0);
        expect(component.questions.length).toBe(0);
    });
    it('Should update question on call to handleSaveQuestion', () => {
        const question1 = { ...validQuestion };
        question1.text = '1';
        const question2 = { ...validQuestion };
        question2.text = '2';
        component.questions = [question1, question2];
        const question3 = { ...validQuestion };
        question3.text = '3';
        component.handleSaveQuestion(question3, 1);
        expect(component.questions.length).toBe(2);
        expect(component.questions[1].text).toBe('3');
    });
    it('Should assign id to game by calling route.ParamMap', () => {
        observableParamMap.subscribe(() => {
            expect(paramMapSpy).toHaveBeenCalled();
        });
    });
});
