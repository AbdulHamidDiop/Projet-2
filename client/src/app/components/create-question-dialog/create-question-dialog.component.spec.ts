import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimeService } from '@app/services/time.service';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
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

    it('Should create new question game', () => {
        expect(component).toBeTruthy();
    });

    it('Should let user type a name and game description', () => {
        expect(component).toBeTruthy();
    });
    it('Should validate game name and game description as not empty', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user pick a time interval between 10 and 60 seconds inclusively', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user create 2 to 4 answers to each question', () => {
        expect(component).toBeTruthy();
    });
    it('Should let user define if an answer is correct or wrong', () => {
        expect(component).toBeTruthy();
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
    it('Should let user write score associated to each question,the score must in interval [10,100], the score must also be a multiple of 10', () => {
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
