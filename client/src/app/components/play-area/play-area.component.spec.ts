/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent, SHOW_FEEDBACK_DELAY } from '@app/components/play-area/play-area.component';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Game, Question, Type } from '@common/game';
import { validQuestion } from '@common/test-interfaces';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const DEFAULT_POINTS = 10;
const BONUS_MULTIPLIER = 0.2;
describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameManager: GameManagerService;
    let socketMock: SpyObj<SocketRoomService>;
    let matDialogMock: SpyObj<MatDialog>;
    let matDialogRefSpy: SpyObj<MatDialogRef<any, any>>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'time'], ['counter', 'interval']);
        timeServiceSpy.startTimer.and.returnValue();
        timeServiceSpy.time = 0;
        socketMock = jasmine.createSpyObj('SocketRoomService', ['listenForMessages', 'sendMessage']);
        socketMock.listenForMessages.and.returnValue(of({} as any));
        socketMock.sendMessage.and.returnValue({} as any);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefSpy.afterClosed.and.returnValue(of(true));
        matDialogMock.open.and.returnValue(matDialogRefSpy);
        await TestBed.configureTestingModule({
            imports: [MatListModule, BrowserAnimationsModule],
            declarations: [PlayAreaComponent],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-game-id' }, queryParams: { testMode: 'true' } } } },
                {
                    provide: GameManagerService,
                    useValue: jasmine.createSpyObj('GameManagerService', {
                        nextQuestion: () => ({
                            id: 'test-qcm',
                            type: Type.QCM,
                            text: 'Test QCM Question?',
                            points: 10,
                            lastModification: new Date(),
                            choices: [
                                { text: 'Option 1', isCorrect: true },
                                { text: 'Option 2', isCorrect: false },
                            ],
                        }),
                        initialize: () => {
                            return;
                        },
                        reset: () => {
                            return;
                        },
                        isCorrectAnswer: async () => Promise.resolve(true),
                        getFeedBack: () => of([{ choice: 'Option 1', status: 'correct' }]),
                    }),
                },
                {
                    provide: MatDialog,
                    useValue: matDialogMock,
                },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                {
                    provide: SocketRoomService,
                    useValue: socketMock,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => {
                                    return '.';
                                },
                            },
                            queryParams: {
                                testMode: 'true',
                            },
                        },
                    },
                },
            ],
        }).compileComponents();

        gameManager = TestBed.inject(GameManagerService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component.question = validQuestion;
        gameManager = TestBed.inject(GameManagerService);
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.getEnv().allowRespy(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        component.inTestMode = true;
    });

    it('should use timers', fakeAsync(() => {
        component.onCountDownModalClosed();
        component.inTestMode = true;
        component.countPointsAndNextQuestion();
        tick(SHOW_FEEDBACK_DELAY * 2);
        component.inTestMode = false;
        component.countPointsAndNextQuestion();
        tick(SHOW_FEEDBACK_DELAY * 2);
        expect(component).toBeTruthy();
    }));

    it('Should call socket.sendMessage on call to notifyEndGame', () => {
        component.notifyEndGame();
        expect(socketMock.sendMessage).toHaveBeenCalled();
    });

    it('Should call socket.sendMessage on call to notifyNextQuestion', () => {
        component.notifyNextQuestion();
        expect(socketMock.sendMessage).toHaveBeenCalled();
    });

    it('handleQCMChoice should allow multiple selections and set the answer array correctly', () => {
        component.handleQCMChoice('Option 1');
        component.handleQCMChoice('Option 2');

        expect(component.answer).toEqual(['Option 1', 'Option 2']);

        component.handleQCMChoice('Option 1');
        expect(component.answer).toEqual(['Option 2']);

        component.handleQCMChoice('Option 2');
        expect(component.answer.length).toBe(0);
    });

    it('nextQuestion should call gameManager.nextQuestion', fakeAsync(() => {
        // Prepare the next question to be returned by the GameManagerService
        gameManager = TestBed.inject(GameManagerService);
        spyOn(component, 'countPointsAndNextQuestion').and.returnValue();

        component.nextQuestion();
        expect(gameManager.nextQuestion).toHaveBeenCalled();
        fixture.detectChanges();
        flush();
    }));

    it('mouseHitDetect should call startTimer with 5 seconds on left click', () => {
        const mockEvent = { button: 0 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    });

    it('buttonDetect should modify the buttonPressed variable and call handleQCMChoice', () => {
        spyOn(component, 'handleQCMChoice');
        component.question = {
            type: Type.QCM,
            choices: [
                { text: 'Option 1', isCorrect: true },
                { text: 'Option 2', isCorrect: false },
            ],
        } as Question;
        component.nbChoices = component.question.choices.length;

        const expectedKey = '1';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
        expect(component.handleQCMChoice).toHaveBeenCalled();
    });

    it('isChoice should return true for selected choices and false for unselected', () => {
        const choices = [{ text: 'Option 1' }];
        component.answer = choices.map((choice) => choice.text);
        component.handleQCMChoice(choices[0].text);
        expect(component.isChoice(choices[0].text)).toBe(false);
        component.handleQCMChoice(choices[0].text);
        expect(component.isChoice(choices[0].text)).toBe(true);
    });

    it('should handle keyboard events for different keys', () => {
        fixture.detectChanges();
        const componentElement = fixture.nativeElement;
        spyOn(component, 'buttonDetect').and.callThrough();
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        componentElement.dispatchEvent(event);
        fixture.detectChanges();
        expect(component.buttonDetect).toHaveBeenCalled();
    });

    it('nextQuestion should reset answer', () => {
        component.answer = ['Some Answer', 'Another Answer'];
        component.nextQuestion();
        expect(component.answer).toEqual([]);
    });

    it('updateScore should correctly update score for correct answers', fakeAsync(() => {
        jasmine.getEnv().allowRespy(true);
        spyOn(gameManager, 'isCorrectAnswer').and.returnValue(Promise.resolve(true));

        component.question = {
            points: 10,
        } as unknown as Question;
        component.score = 0;
        component.updateScore();
        tick(SHOW_FEEDBACK_DELAY * 2);
        expect(component.score).toBe(DEFAULT_POINTS * BONUS_MULTIPLIER);
        component.score = 0;
        component.question = {
            type: Type.QRL,
            points: 10,
        } as unknown as Question;
        component.updateScore();
        tick(SHOW_FEEDBACK_DELAY * 2);
        expect(component.score).toBe(DEFAULT_POINTS);
    }));

    it('updateScore should not update score for incorrect or incomplete answers', () => {
        component.question = {
            choices: [
                { text: 'Answer 1', isCorrect: true },
                { text: 'Answer 2', isCorrect: true },
            ],
        } as Question;
        component.answer = ['Answer 1'];
        component.updateScore();
        expect(component.score).toBe(0);
        component.answer = [];
        component.updateScore();
        expect(component.score).toBe(0);
    });

    it('shouldRender should return false for empty text', () => {
        expect(component.shouldRender('')).toBeFalse();
    });

    it('pressing a number key should call handleQCMChoice with the right choice selected', () => {
        component.question = validQuestion;
        component.nbChoices = validQuestion.choices.length;
        const choices = component.question.choices;
        if (choices) {
            const choice = choices[0];
            spyOn(component, 'handleQCMChoice');
            const event = new KeyboardEvent('keydown', { key: '1' });
            component.buttonDetect(event);
            expect(component.handleQCMChoice).toHaveBeenCalledWith(choice.text);
        }
    });

    it('pressing a number once should add the choice to the answer array and twice should remove it', () => {
        component.question = validQuestion;
        component.nbChoices = validQuestion.choices.length;
        const choices = component.question.choices;
        if (choices) {
            const choice = choices[0];
            const event = new KeyboardEvent('keydown', { key: '1' });
            component.buttonDetect(event);
            expect(component.answer).toContain(choice.text);
            component.buttonDetect(event);
            expect(component.answer).not.toContain(choice.text);
        }
    });

    it('selecting a wrong choice should not increase the score', () => {
        component.question = validQuestion;
        component.nbChoices = validQuestion.choices.length;
        const choices = component.question.choices;
        if (choices) {
            const wrongChoice = choices.find((choice) => !choice.isCorrect);
            if (wrongChoice) {
                component.handleQCMChoice(wrongChoice.text);
                component.updateScore();
                expect(component.playerScore).toBe(0);
            }
        }
    });

    it('confirmAnswers should be called when the timer runs out', fakeAsync(() => {
        timeServiceSpy.time = 0;
        spyOn(component, 'confirmAnswers').and.returnValue({} as any);
        const time = component.time;
        expect(time).toEqual(0);
        expect(component.confirmAnswers).toHaveBeenCalled();
        flush();
    }));

    it('confirmAnswers should update score and proceed after delay', fakeAsync(() => {
        spyOn(component, 'updateScore').and.returnValue({} as any);
        spyOn(component, 'nextQuestion').and.returnValue();
        component.confirmAnswers();
        tick(SHOW_FEEDBACK_DELAY * 2);
        expect(component.updateScore).toHaveBeenCalled();
        expect(component.disableChoices).toBeFalse();
        expect(component.nextQuestion).toHaveBeenCalled();
    }));

    it('handleAbort should reset score and navigate on confirmation', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        spyOn(component.router, 'navigate');
        component.handleAbort();
        expect(component.abortDialog.open).toHaveBeenCalled();
        component.abortDialog.closeAll();
        dialogRefSpyObj.afterClosed().subscribe(() => {
            expect(component.score).toBe(0);
            expect(component.answer.length).toBe(0);
            expect(component.router.navigate).toHaveBeenCalledWith(['/']);
        });
    });

    it('should get feedback and update state for QCM questions', fakeAsync(() => {
        component.question = { id: '123', type: Type.QCM } as Question;
        component.answer = ['Option 1'];
        spyOn(component, 'countPointsAndNextQuestion').and.returnValue();
        component.confirmAnswers();
        expect(gameManager.getFeedBack).toHaveBeenCalledWith('123', ['Option 1']);
        flush();
    }));

    it('should navigate to createGame if this.GameManager.endGame is true', () => {
        spyOn(component.router, 'navigate');
        gameManager.endGame = true;
        component.endGameTest();
        expect(component.router.navigate).toHaveBeenCalledWith(['/createGame']);
    });

    it('should set inTestMode to true when queryparams testMode is true', () => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot.queryParams = { testMode: 'true' };
        component = fixture.componentInstance;
        expect(component.inTestMode).toBeTrue();
    });
    it('should initialize this.question on init', async () => {
        component.gameManager.game = { duration: 10, questions: [{ type: Type.QCM, choices: [] } as unknown as Question] } as unknown as Game;
        await component.ngOnInit();
        expect(component.question).toBeDefined();
    });

    it('returns the correct score', () => {
        expect(component.point).toEqual(0);
    });

    describe('getStyle should return the correct style based on choice correctness and selection', () => {
        it('should return "correct" for a correct choice', () => {
            component.feedback = [{ choice: 'Option 1', status: 'correct' }];
            const style = component.getStyle('Option 1');
            expect(style).toBe('correct');
        });
        it('should return "incorrect" for an incorrect choice', () => {
            component.feedback = [{ choice: 'Option 2', status: 'incorrect' }];
            const style = component.getStyle('Option 2');
            expect(style).toBe('incorrect');
        });
        it('should return "missed" for a missed choice', () => {
            component.feedback = [{ choice: 'Option 3', status: 'missed' }];
            const style = component.getStyle('Option 3');
            expect(style).toBe('missed');
        });
        it('should return an empty string if the choice is not found in the feedback', () => {
            component.feedback = [{ choice: 'Option 4', status: 'correct' }];
            const style = component.getStyle('Option 5');
            expect(style).toBe('');
        });
    });
});
