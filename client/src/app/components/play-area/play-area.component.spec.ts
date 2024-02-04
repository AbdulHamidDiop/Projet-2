import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { QuestionsService } from '@app/services/questions.service';
import { TimeService } from '@app/services/time.service';
import { Question, Type } from '@common/game';
import SpyObj = jasmine.SpyObj;

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
            providers: [{ provide: TimeService, useValue: timeServiceSpy }, QuestionsService],
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
            component.handleQCMChoice(choice.text, choice.isCorrect);
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
                component.handleQCMChoice(choice.text, choice.isCorrect);
            });

            choices.forEach((choice) => {
                expect(component.isChoice(choice.text)).toBe(true);
            });
        }
    });

    it('getStyle should return the correct style for selected and unselected choices', () => {
        const choices = component.question.choices ?? [];
        choices.forEach((choice) => {
            component.handleQCMChoice(choice.text, choice.isCorrect);
        });

        choices.forEach((choice) => {
            expect(component.getStyle(choice.text)).toBe('selected');
        });

        const unselectedChoice = 'Unselected choice';
        expect(component.getStyle(unselectedChoice)).toBe('');
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

    it('updateScore should reset answer and isCorrect', () => {
        component.isCorrect = [true, true];
        component.answer = ['Some Answer', 'Another Answer'];
        component.updateScore();
        expect(component.answer).toEqual([]);
        expect(component.isCorrect).toEqual([]);
    });

    it('shouldRender should return false for empty text', () => {
        expect(component.shouldRender('')).toBeFalse();
    });
});
