/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-lines */
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { AdminQuestionComponent } from '@app/components/admin-question/admin-question.component';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { FetchService } from '@app/services/fetch.service';
import { GameService } from '@app/services/game.service';
import { Game, Question, Type } from '@common/game';
import { Observable } from 'rxjs';
import { AdminCreateGamePageComponent } from './admin-create-game-page.component';

async function addGameMock(): Promise<void> {
    return;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockData: any = {};

async function arrayBufferMock(): Promise<ArrayBuffer> {
    const buffer = new ArrayBuffer(0);
    return buffer;
}

async function blobMock(): Promise<Blob> {
    const blob = new Blob();
    return blob;
}

async function formDataMock(): Promise<FormData> {
    const formData = new FormData();
    return formData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonMock(): Promise<any> {
    return mockData;
}

async function textMock(): Promise<string> {
    return '';
}

const responseSetToOk = true;
const response: Response = {
    ok: true,
    status: 200,
    headers: new Headers(),
    type: 'basic',
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};
const errorResponse: Response = {
    ok: false,
    status: 404,
    type: 'basic',
    headers: new Headers(),
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};

async function fetchMock(): Promise<Response> {
    if (responseSetToOk) {
        return response;
    } else {
        return errorResponse;
    }
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
    const gameServiceSpy = jasmine.createSpy('getAllGames').and.returnValue([validGame]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observableParamMap: Observable<any> = new Observable((subscriber) => {
        subscriber.next({ get: () => false });
        subscriber.next({ get: () => '1234' });
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
                        getGameByID: getGameByIdSpy,
                        addGame: addGameSpy,
                        getAllGames: gameServiceSpy,
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
                        paramMap: observableParamMap,
                    },
                },
                {
                    provide: FetchService,
                    useValue: {
                        fetch: jasmine.createSpy().and.callFake(fetchMock),
                    },
                },
            ],
        }).compileComponents();
    });
    beforeEach(async () => {
        fixture = TestBed.createComponent(AdminCreateGamePageComponent);
        fixture = TestBed.createComponent(AdminCreateGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await component.ngOnInit();
        component.ngAfterViewInit();
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
        observableParamMap.subscribe((params) => {
            if (params.get('id')) {
                expect(component.id).toBe('1234');
            }
        });
    });
});
