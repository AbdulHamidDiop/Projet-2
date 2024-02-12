import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent, SHOW_FEEDBACK_DELAY } from '@app/components/play-area/play-area.component';
import { QuestionsService } from '@app/services/questions.service';
import { TimeService } from '@app/services/time.service';
import { Question, Type } from '@common/game';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const ONE_SECOND = 1000;
const DEFAULT_POINTS = 10;
// TODO : update once QRL questions are implemented
describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let questionsService: QuestionsService;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);

        await TestBed.configureTestingModule({
            imports: [MatListModule, BrowserAnimationsModule],
            declarations: [PlayAreaComponent],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                {
                    provide: QuestionsService,
                    useValue: {
                        get question(): {
                            id: 'test-qcm';
                            type: Type.QCM;
                            text: 'Test QCM Question?';
                            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                            points: 10;
                            lastModification: Date;
                            choices: [{ text: 'Option 1'; isCorrect: true }, { text: 'Option 2'; isCorrect: false }];
                        } {
                            return {
                                id: 'test-qcm',
                                type: Type.QCM,
                                text: 'Test QCM Question?',
                                points: 10,
                                lastModification: new Date(),
                                choices: [
                                    { text: 'Option 1', isCorrect: true },
                                    { text: 'Option 2', isCorrect: false },
                                ],
                            };
                        },
                    },
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }),
                        closeAll: jasmine.createSpy('closeAll'),
                    },
                },
            ],
        }).compileComponents();

        questionsService = TestBed.inject(QuestionsService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;

        const qcmQuestion: Question = {
            id: 'test-qcm',
            type: Type.QCM,
            text: 'Test QCM Question?',
            points: 10,
            lastModification: new Date(),
            choices: [
                { text: 'Option 1', isCorrect: true },
                { text: 'Option 2', isCorrect: false },
            ],
        };

        spyOnProperty(questionsService, 'question', 'get').and.returnValue(qcmQuestion);

        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.getEnv().allowRespy(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleQCMChoice should allow multiple selections and update score correctly', () => {
        const correctChoices = component.question.choices.filter((choice) => choice.isCorrect);
        correctChoices.forEach((choice) => {
            component.handleQCMChoice(choice.text);
        });

        component.updateScore();

        const expectedScore = correctChoices.length * component.question.points;
        expect(component.playerScore).toBe(expectedScore);
    });

    it('nextQuestion should load a new QCM question', () => {
        const newQCMQuestion: Question = {
            id: 'new-qcm',
            type: Type.QCM,
            text: 'Next QCM Question?',
            points: 20,
            lastModification: new Date(),
            choices: [
                { text: 'New Option 1', isCorrect: false },
                { text: 'New Option 2', isCorrect: true },
            ],
        };

        spyOnProperty(questionsService, 'question', 'get').and.returnValue(newQCMQuestion);

        component.nextQuestion();

        expect(component.question).toEqual(newQCMQuestion);
        expect(component.nbChoices).toBe(newQCMQuestion.choices?.length ?? 0);
    });

    it('mouseHitDetect should call startTimer with 5 seconds on left click', () => {
        const mockEvent = { button: 0 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('isChoice should return true for selected choices', () => {
        const choices = component.question.choices;
        if (choices) {
            choices.forEach((choice) => {
                component.handleQCMChoice(choice.text);
            });

            choices.forEach((choice) => {
                expect(component.isChoice(choice.text)).toBe(true);
            });
        }
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

    it('updateScore should correctly update score for correct answers', () => {
        component.question = {
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: true },
                { text: 'Answer 2', isCorrect: false },
            ],
        } as Question;
        component.answer = ['Answer 1'];
        component.updateScore();
        expect(component.score).toEqual(DEFAULT_POINTS);
    });

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

    it('confirmAnswers should be called when the timer runs out', () => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        spyOn(component, 'confirmAnswers').and.callThrough();
        component.timeService.startTimer(1);
        fakeAsync(() => {
            tick(ONE_SECOND);
            expect(component.confirmAnswers).toHaveBeenCalled();
        });
    });

    it('confirmAnswers should update score and proceed after delay', fakeAsync(() => {
        spyOn(component, 'updateScore').and.callThrough();
        spyOn(component, 'nextQuestion').and.callThrough();
        component.confirmAnswers();
        expect(component.disableChoices).toBeTrue();
        expect(component.showFeedback).toBeTrue();
        tick(SHOW_FEEDBACK_DELAY);
        expect(component.updateScore).toHaveBeenCalled();
        expect(component.showFeedback).toBeFalse();
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
            expect(component.router.navigate).toHaveBeenCalledWith(['/createGame']);
        });
    });

    // TODO: confirmer que get point() est inutile et enlever ce test
    it('returns the correct score', () => {
        expect(component.point).toEqual(0);
    });

    describe('getStyle should return the correct style based on choice correctness and selection', () => {
        beforeEach(() => {
            component.question = {
                id: 'test-qcm',
                type: Type.QCM,
                text: 'Test QCM Question?',
                points: 10,
                lastModification: new Date(),
                choices: [
                    { text: 'Option 1', isCorrect: true },
                    { text: 'Option 2', isCorrect: false },
                    { text: 'Option 3', isCorrect: true },
                ],
            };

            component.showFeedback = true;

            component.handleQCMChoice('Option 1'); // Correct and selected
            component.handleQCMChoice('Option 2'); // Incorrect and selected
        });

        it('returns "correct" for correct and selected choices', () => {
            expect(component.getStyle('Option 1')).toBe('correct');
        });

        it('returns "incorrect" for incorrect and selected choices', () => {
            expect(component.getStyle('Option 2')).toBe('incorrect');
        });

        it('returns "missed" for correct but unselected choices', () => {
            expect(component.getStyle('Option 3')).toBe('missed');
        });

        it('returns an empty string for unselected and incorrect choices', () => {
            const unselectedIncorrectChoice = 'Unselected Incorrect Choice';
            expect(component.getStyle(unselectedIncorrectChoice)).toBe('');
        });
    });
});
