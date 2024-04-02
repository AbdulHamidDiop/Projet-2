/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Game, Question, Type } from '@common/game';
import { SHOW_FEEDBACK_DELAY } from './const';

import { Events, Namespaces } from '@common/sockets';
import { VALID_QUESTION } from '@common/test-interfaces';
import { Subject, of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const DEFAULT_POINTS = 10;
const BONUS_MULTIPLIER = 1.2;
describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameManager: GameManagerService;
    let socketMock: SpyObj<SocketRoomService>;
    let matDialogMock: SpyObj<MatDialog>;
    let matDialogRefSpy: SpyObj<MatDialogRef<any, any>>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'time', 'timerEnded'], ['counter', 'interval']);
        timeServiceSpy.startTimer.and.returnValue();
        timeServiceSpy.timerEnded = new EventEmitter<void>();

        socketMock = jasmine.createSpyObj('SocketRoomService', ['listenForMessages', 'sendMessage', 'sendChatMessage', 'endGame']);
        socketMock.listenForMessages.and.returnValue(of({} as any));
        socketMock.sendMessage.and.returnValue({} as any);
        socketMock.endGame.and.returnValue();

        matDialogMock = jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'afterClosed']);
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefSpy.afterClosed.and.returnValue(of(true));
        matDialogMock.open.and.returnValue(matDialogRefSpy);

        await TestBed.configureTestingModule({
            imports: [MatListModule, BrowserAnimationsModule, MatSnackBarModule, MatDialogModule],
            declarations: [PlayAreaComponent],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-game-id' }, queryParams: { testMode: 'true' } } } },
                {
                    provide: GameManagerService,
                    useValue: jasmine.createSpyObj('GameManagerService', {
                        goNextQuestion: () => ({
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
                        firstQuestion: () => ({
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
        component.question = { ...VALID_QUESTION };
        gameManager = TestBed.inject(GameManagerService);
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.getEnv().allowRespy(true);
        TestBed.resetTestingModule();
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

    it('handleQCMChoice should allow multiple selections and set the answer array correctly', () => {
        component.handleQCMChoice('Option 1');
        component.handleQCMChoice('Option 2');

        expect(component.answer).toEqual(['Option 1', 'Option 2']);

        component.handleQCMChoice('Option 1');
        expect(component.answer).toEqual(['Option 2']);

        component.handleQCMChoice('Option 2');
        expect(component.answer.length).toBe(0);
    });

    it('goNextQuestion should call gameManager.goNextQuestion', fakeAsync(() => {
        // Prepare the next question to be returned by the GameManagerService
        gameManager = TestBed.inject(GameManagerService);
        spyOn(component, 'countPointsAndNextQuestion').and.returnValue(Promise.resolve());

        component.goNextQuestion();
        expect(gameManager.goNextQuestion).toHaveBeenCalled();
        fixture.detectChanges();
        flush();
    }));

    it('mouseHitDetect should call startTimer with 5 seconds on left click', () => {
        const mockEvent = { button: 0 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    });

    it('detectButton should modify the buttonPressed variable and call handleQCMChoice', () => {
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
        component.detectButton(buttonEvent);
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
        spyOn(component, 'detectButton').and.callThrough();
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        componentElement.dispatchEvent(event);
        fixture.detectChanges();
        expect(component.detectButton).toHaveBeenCalled();
    });

    it('goNextQuestion should reset answer', () => {
        component.answer = ['Some Answer', 'Another Answer'];
        component.goNextQuestion();
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
        component.question = VALID_QUESTION;
        component.nbChoices = VALID_QUESTION.choices.length;
        const choices = component.question.choices;
        if (choices) {
            const choice = choices[0];
            spyOn(component, 'handleQCMChoice');
            const event = new KeyboardEvent('keydown', { key: '1' });
            component.detectButton(event);
            expect(component.handleQCMChoice).toHaveBeenCalledWith(choice.text);
        }
    });

    it('pressing a number once should add the choice to the answer array and twice should remove it', () => {
        component.question = VALID_QUESTION;
        component.nbChoices = VALID_QUESTION.choices.length;
        const choices = component.question.choices;
        if (choices) {
            const choice = choices[0];
            const event = new KeyboardEvent('keydown', { key: '1' });
            component.detectButton(event);
            expect(component.answer).toContain(choice.text);
            component.detectButton(event);
            expect(component.answer).not.toContain(choice.text);
        }
    });

    it('selecting a wrong choice should not increase the score', () => {
        component.question = { ...VALID_QUESTION };
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

    it('confirmAnswers should update score and proceed after delay', fakeAsync(() => {
        spyOn(component, 'updateScore').and.returnValue({} as any);
        spyOn(component, 'goNextQuestion').and.returnValue();
        component.confirmAnswers();
        tick(SHOW_FEEDBACK_DELAY * 2);
        expect(component.updateScore).toHaveBeenCalled();
        expect(component.choiceDisabled).toBeFalse();
        expect(component.goNextQuestion).toHaveBeenCalled();
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
        });
    });

    it('should get feedback and update state for QCM questions', fakeAsync(() => {
        component.question = { id: '123', type: Type.QCM } as Question;
        component.answer = ['Option 1'];
        spyOn(component, 'countPointsAndNextQuestion').and.returnValue(Promise.resolve());
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

    describe('PlayAreaComponent with dynamic socket messages', () => {
        const nextQuestionSubject = new Subject<void>();
        const endGameSubject = new Subject<void>();
        const startTimerSubject = new Subject<void>();
        const stopTimerSubject = new Subject<void>();
        const bonusSubject = new Subject<void>();
        const bonusGivenSubject = new Subject<void>();
        const abortGameSubject = new Subject<void>();

        beforeEach(async () => {
            socketMock.listenForMessages.and.callFake((namespace: string, event: string) => {
                if (namespace === Namespaces.GAME && event === Events.NEXT_QUESTION) {
                    return nextQuestionSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.END_GAME) {
                    return endGameSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.START_TIMER) {
                    return startTimerSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.STOP_TIMER) {
                    return stopTimerSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.BONUS) {
                    return bonusSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.BONUS_GIVEN) {
                    return bonusGivenSubject.asObservable();
                } else if (namespace === Namespaces.GAME && event === Events.ABORT_GAME) {
                    return abortGameSubject.asObservable();
                }
                return new Subject().asObservable();
            });
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(PlayAreaComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        afterEach(() => {
            component.ngOnDestroy();
        });

        it('should handle NEXT_QUESTION event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.NEXT_QUESTION).subscribe(() => {
                component.confirmAnswers();
            });
            spyOn(component, 'confirmAnswers').and.resolveTo();
            nextQuestionSubject.next();
            flush();

            expect(component.confirmAnswers).toHaveBeenCalled();
            nextQuestionSubject.complete();
        }));

        it('should handle END_GAME event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.END_GAME).subscribe(() => {
                component.endGame();
            });

            spyOn(component, 'endGame').and.callThrough();
            endGameSubject.next();
            flush();

            expect(component.endGame).toHaveBeenCalled();
            endGameSubject.complete();
        }));

        it('should handle START_TIMER event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.START_TIMER).subscribe(() => {
                component.timeService.startTimer(0);
            });

            component.gameManager.game = { duration: 10 } as Game;
            spyOn(component.timeService, 'startTimer');
            startTimerSubject.next();
            flush();

            expect(component.timeService.startTimer).toHaveBeenCalledWith(jasmine.any(Number));
            startTimerSubject.complete();
        }));

        it('should handle STOP_TIMER event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.STOP_TIMER).subscribe(() => {
                component.timeService.stopTimer();
            });

            spyOn(component.timeService, 'stopTimer');
            stopTimerSubject.next();
            flush();

            expect(component.timeService.stopTimer).toHaveBeenCalled();
            stopTimerSubject.complete();
        }));

        it('should handle BONUS event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.BONUS).subscribe(() => {
                component.gotBonus = true;
            });

            bonusSubject.next();
            flush();

            expect(component.gotBonus).toBeTrue();
            bonusSubject.complete();
        }));

        it('should handle BONUS_GIVEN event', fakeAsync(() => {
            component.socketService.listenForMessages(Namespaces.GAME, Events.BONUS_GIVEN).subscribe(() => {
                component.bonusGiven = true;
            });

            bonusGivenSubject.next();
            flush();

            expect(component.bonusGiven).toBeTrue();
            bonusGivenSubject.complete();
        }));
    });
});
