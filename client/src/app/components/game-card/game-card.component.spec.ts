import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import SpyObj = jasmine.SpyObj;

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let httpClient: HttpClient;
    let router: Router;
    const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };

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

    it('should call onExportButtonClick method', () => {
        const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callThrough();
        const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

        component.onExportButtonClick(game);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
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
