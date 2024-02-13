import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { Game } from '@common/game';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
<<<<<<< HEAD
    let mockGameFile: unknown;
=======
    let mockGameFile: any;
>>>>>>> dev
    let fakeFile: File;
    let readFileSpy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, SidebarComponent, PlayAreaComponent],
        }).compileComponents();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [CommunicationService, GameService],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockGameFile = {
            id: '462778813469',
            title: 'Trivia des top 50 artistes des années 2000',
            description: 'Questaqions de pratique sur le langage JavaScript',
            duration: 60,
            lastModification: '2024-02-02T17:56:00.555Z',
            isHidden: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 40,
                    choices: [
                        {
                            text: 'var',
                            isCorrect: true,
                        },
                        {
                            text: 'self',
                            isCorrect: false,
                        },
                        {
                            text: 'this',
                            isCorrect: true,
                        },
                        {
                            text: 'int',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QCM',
                    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                    points: 20,
                    choices: [
                        {
                            text: 'Non',
                            isCorrect: true,
                        },
                        {
                            text: 'Oui',
                            isCorrect: false,
                        },
                    ],
                },
            ],
        };
        component.games = [];
        fakeFile = new File(['foo'], 'foo.txt', {
            type: 'application/json',
        });
        component.selectedFile = fakeFile;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home if not authenticated', () => {
        component.communicationService.sharedVariable$ = of(false);
        const routerSpy = spyOn(component.router, 'navigate');
        component.ngOnInit();
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should get games when authentificated', async () => {
        component.communicationService.sharedVariable$ = of(true);
        const mockGame: Game = {
            id: '1',
            title: 'test',
            questions: [],
        };
        spyOn(component.gameService, 'getAllGames').and.returnValue(Promise.resolve([mockGame]));
        await component.ngOnInit();
        expect(component.games).toEqual([mockGame]);
    });

    it('should navigate to createGame when onCreateButtonClick is called', () => {
        const routerSpy = spyOn(component.router, 'navigate');
        component.onCreateButtonClick();
        expect(routerSpy).toHaveBeenCalledWith(['/admin/createGame']);
    });

    it('should navigate to questions bank if when onQuestionsButtonClick is called', () => {
        const routerSpy = spyOn(component.router, 'navigate');
        component.onQuestionsButtonClick();
        expect(routerSpy).toHaveBeenCalledWith(['/admin/questions']);
    });

    it('should modify lastModification of game when onCheckGame is called', () => {
        const mockGame: Game = {
            id: '1',
            title: 'test',
            questions: [],
            lastModification: new Date(),
        };
        component.onCheckGame(mockGame);
        expect(mockGame.lastModification).toEqual(new Date());
    });

    it('should delete game when onDeleteGame is called', () => {
        const mockGame1: Game = {
            id: '1',
            title: 'test1',
            questions: [],
        };
        component.games.push(mockGame1);
        const mockGame2: Game = {
            id: '2',
            title: 'test2',
            questions: [],
        };
        component.games.push(mockGame2);
        component.onDeleteGame(mockGame1);
        expect(component.games).toEqual([mockGame2]);
    });

    it('isGame should be true when the game meets the criterias', () => {
        expect(component.isGame(mockGameFile)).toBeTrue();
    });
    it('isGame should be false when the title is not a string or is undefined', () => {
        mockGameFile.title = 2;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.title = undefined;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when the title is already used', () => {
        const mockGame: Game = {
            id: '1',
            title: 'Trivia des top 50 artistes des années 2000',
            questions: [],
        };
        component.games.push(mockGame);
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when the description is not a string or is undefined', () => {
        mockGameFile.description = 2;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.description = undefined;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when the duration is not a number or is undefined', () => {
        mockGameFile.duration = '2';
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.duration = undefined;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when the duration is under 10 or over 60 seconds and true inbetween', () => {
        mockGameFile.duration = 61;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.duration = 9;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should return false when questions is undefined', () => {
        mockGameFile.questions = undefined;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should return false when question type is not QCM or QRL', () => {
        mockGameFile.questions[0].type = 'QC';
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should return false when question text is not type string', () => {
        mockGameFile.questions[0].text = 2;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should return false when question points are under 10, over 100 or is not a multiple of 10', () => {
        mockGameFile.questions[0].points = 9;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.questions[0].points = 101;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.questions[0].points = 51;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should return false when the number of choices are under 2 or over 4', () => {
        mockGameFile.questions[0].choices = [{ text: 'Choice 1', isCorrect: true }];
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.questions[0].choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: true },
            { text: 'Choice 4', isCorrect: true },
            { text: 'Choice 5', isCorrect: false },
        ];
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when the text of a choice is not a string or is undefined', () => {
        mockGameFile.questions[0].choices[0].text = 2;
        expect(component.isGame(mockGameFile)).toBeFalse();
        mockGameFile.questions[0].choices[0].text = undefined;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });
    it('isGame should be false when isCorrect of question choices are all true or all false', () => {
        mockGameFile.questions[1].choices[1].isCorrect = true;
        expect(component.isGame(mockGameFile)).toBeFalse();
    });

    it('handleFile should print "Le jeu a été importé correctement." when isGame is true', () => {
        const nativeElementMock = {
            querySelector: jasmine.createSpy('querySelector').and.returnValue({ innerText: '' }),
        };
        component.el = { nativeElement: nativeElementMock };

        spyOn(component, 'isGame').and.returnValue(true);
        component.handleFile(mockGameFile);
        expect(nativeElementMock.querySelector).toHaveBeenCalledWith('#handleErrorsGrid');
        expect(nativeElementMock.querySelector('#handleErrorsGrid').innerText).toEqual('Le jeu a été importé correctement.');
    });
    it('handleFile should print "erreurs" when isGame is false', () => {
        component.errors = 'erreurs';
        const nativeElementMock = {
            querySelector: jasmine.createSpy('querySelector').and.returnValue({ innerText: '' }),
        };
        component.el = { nativeElement: nativeElementMock };

        spyOn(component, 'isGame').and.returnValue(false);
        component.handleFile(mockGameFile);
        expect(nativeElementMock.querySelector).toHaveBeenCalledWith('#handleErrorsGrid');
        expect(nativeElementMock.querySelector('#handleErrorsGrid').innerText).toEqual('erreurs');
    });
    it('onImportButtonClick should print "Le type de fichier est invalide..." when VerifyIfJSON is false', () => {
        const nativeElementMock = {
            querySelector: jasmine.createSpy('querySelector').and.returnValue({ innerText: '' }),
        };
        component.el = { nativeElement: nativeElementMock };

        spyOn(component, 'verifyIfJSON').and.returnValue(false);
        component.onImportButtonClick();
        expect(nativeElementMock.querySelector).toHaveBeenCalledWith('#handleErrorsGrid');
        expect(nativeElementMock.querySelector('#handleErrorsGrid').innerText).toEqual(
            'Le type de fichier est invalide. Veuillez sélectionner un fichier de type JSON.',
        );
    });
    it('onImportButtonClick should handleFile if verifyIsJSON is true', () => {
        readFileSpy = spyOn(component, 'readFile').and.returnValue(Promise.resolve([]));
        spyOn(component, 'verifyIfJSON').and.returnValue(true);

        component.onImportButtonClick();

        expect(readFileSpy).toHaveBeenCalledWith(fakeFile);
    });
    it('verifyIfJSON should return true when file is JSON type', () => {
        expect(component.verifyIfJSON()).toBeTrue();
    });
    it('should set selectedFile when a file is selected', () => {
        const mockEvent = { target: { files: [fakeFile] } } as unknown as Event;

        component.onFileSelected(mockEvent);

        expect(component.selectedFile).toEqual(fakeFile);
    });
});
