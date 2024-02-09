import { CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Game } from '@app/interfaces/game-elements';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game.service';
import { Observable } from 'rxjs';
import { AdminCreateGamePageComponent } from './admin-create-game-page.component';

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
            },
            {
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
                ],
                answer: 'Choix #1',
            },
            {
                id: '0',
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
            },
            {
                id: '3',
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
            },
        ],
        visible: false,
    };
    const observableGame: Observable<Game[]> = new Observable((subscriber) => {
        subscriber.next([validGame]);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule, AppRoutingModule, FormsModule, CdkDropList],
            declarations: [AdminCreateGamePageComponent, SidebarComponent, PlayAreaComponent],
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getGameById: jasmine.createSpy('getGameById').and.returnValue(observableGame),
                    },
                },
                {
                    provide: AdminQuestionsBankComponent,
                    useValue: {
                        questionsBankList: jasmine.createSpy('questionsBankList').and.returnValue({}),
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminCreateGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /*
    it('Should create new question game', () => {
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();

        expect(component.game.title === game.title).toBeTruthy();
        expect(component.game.id === game.id).toBeTruthy();
        expect(component.game.description === game.description).toBeTruthy();
        expect(component.game.visible === game.visible).toBeTruthy();
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

            if (game.questions[i].type === 'QCM') {
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
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();

        expect(component.game.title === game.title).toBeTruthy();
        expect(component.game.description === game.description).toBeTruthy();
    });
    it('Should validate game name and game description as not empty', () => {
        let game: Game = validGame;
        game.title = '';
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = validGame;
        component.populateForm(game); // Pour remettre valid à true. Fait partie de la spec.
        expect(component.gameForm.valid).toBeTruthy();

        game = validGame;
        game.description = '';
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();
    });
    it('Should let user pick a time interval between 10 and 60 seconds inclusively', () => {
        let game: Game = validGame;
        game.duration = 9;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = validGame;
        game.duration = 10;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();

        game = validGame;
        game.duration = 61;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeFalsy();

        game = validGame;
        game.duration = 60;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();
    });

    it('Should let user create 2 to 4 answers to each question', () => {
        const lowerBound = 2;
        const upperBound = 4;
        let game: Game = validGame;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();
        game = validGame;
        while (game.questions.length >= lowerBound) {
            game.questions.slice(1, 1);
        }
        component.populateForm(game);
        expect(component.game.questions.length <= upperBound && component.game.questions.length >= lowerBound);
        expect(component.gameForm.valid).toBeFalsy();

        game = validGame;
        {
            game.questions.push(game.questions[0]);
            game.questions.push(game.questions[0]);
        }
        component.populateForm(game);
        expect(component.game.questions.length <= upperBound && component.game.questions.length >= lowerBound);
        expect(component.gameForm.valid).toBeFalsy();
    });

    it('Should let user define if an answer is correct or wrong', () => {
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(component.game.questions[0].choices[0].isCorrect === game.questions[0].choices[0].isCorrect).toBeTruthy();
    });
    it('Should let user change the order of questions by updating their number id', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user create one or multiple questions', () => {
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
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();
        expect(component.game.visible).toBeFalsy();
    });
    it('Should save data in a persistent manner even after a complete reboot of website and dynamic server ( 100% server-side )', () => {
        expect(component).toBeTruthy();
    });*/
});
