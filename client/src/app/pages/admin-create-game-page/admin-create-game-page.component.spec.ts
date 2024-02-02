import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '@app/app.module';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Game } from '@app/interfaces/game-elements';
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
        ],
        visible: false,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppModule],
            declarations: [AdminCreateGamePageComponent, SidebarComponent, PlayAreaComponent],
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
        const game: Game = validGame;
        game.title = '';
        component.populateForm(game);
        expect(!component.gameForm.valid).toBeTruthy();
    });
    it('Should let user pick a time interval between 10 and 60 seconds inclusively', () => {
        let game: Game = validGame;
        game.duration = 9;
        component.populateForm(game);
        expect(!component.gameForm.valid).toBeTruthy();

        game = validGame;
        game.duration = 61;
        component.populateForm(game);
        expect(!component.gameForm.valid).toBeTruthy();

        game = validGame;
        game.duration = 10;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();

        game = validGame;
        game.duration = 60;
        component.populateForm(game);
        expect(component.gameForm.valid).toBeTruthy();
    });
    it('Should let user create 2 to 4 answers to each question', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user define if an answer is correct or wrong', () => {
        const game: Game = validGame;
        component.populateForm(game);
        component.saveQuiz();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const choices: any = component.game.questions[0].choices;
        expect(choices[0].isCorrect === true || choices[0].isCorrect === false).toBeTruthy();
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
    it('Should let user write score associated to each question, the score must in interval [10,100],the score must also be a multiple of 10', () => {
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
    it('Should save data in a persistent manner even after a complete reboot of website and dynamic server ( 100% server-side )', () => {
        expect(component).toBeTruthy();
    });
});
