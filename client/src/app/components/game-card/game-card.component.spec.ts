import { ComponentFixture, TestBed } from '@angular/core/testing';
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
            declarations: [PlayAreaComponent],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }, QuestionsService],
        }).compileComponents();

        questionsService = TestBed.inject(QuestionsService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('mouseHitDetect should call startTimer with 5 seconds on left click', () => {
        const mockEvent = { button: 0 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    });

    it('mouseHitDetect should not call startTimer on right click', () => {
        const mockEvent = { button: 2 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).not.toHaveBeenCalled();
    });
    it('nextQuestion should load a new question', () => {
        const newQuestion: Question = {
            text: 'Next Question',
            type: Type.QCM,
            points: 20,
            choices: [
                { text: 'Option A', isCorrect: true },
                { text: 'Option B', isCorrect: false },
            ],
            id: '',
            lastModification: new Date(),
        };

        spyOnProperty(questionsService, 'question', 'get').and.returnValue(newQuestion);
        component.nextQuestion();
        expect(component.question).toEqual(newQuestion);
        expect(component.nbChoices).toBe(newQuestion.choices.length);
    });

    it('handleQCMChoice should correctly update score for correct answer', () => {
        const correctChoice = component.question.choices.find((choice) => choice.isCorrect);
        if (correctChoice) {
            component.handleQCMChoice(correctChoice.text, correctChoice.isCorrect);
            component.updateScore();
            expect(component.playerScore).toBe(component.question.points);
        }
    });

    it('updateScore should reset answer and isCorrect', () => {
        component.isCorrect = true;
        component.answer = 'Some Answer';
        component.updateScore();
        expect(component.answer).toBe('');
        expect(component.isCorrect).toBeFalse();
    });

    it('getStyle should return "selected" for current answer', () => {
        const answer = 'Option 1';
        component['answer'] = answer;
        expect(component.getStyle(answer)).toEqual('selected');
    });

    it('shouldRender should return false for empty text', () => {
        expect(component.shouldRender('')).toBeFalse();
    });

    it('shouldRender should return true for non-empty text', () => {
        expect(component.shouldRender('Non-empty')).toBeTrue();
    });
});
