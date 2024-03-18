import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback, Question, Type } from '@common/game';
import { QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

import { HostGameViewComponent } from './host-game-view.component';

describe('HostGameViewComponent', () => {
    let component: HostGameViewComponent;
    let fixture: ComponentFixture<HostGameViewComponent>;
    let gameManagerServiceSpy: SpyObj<GameManagerService>;
    let socketServiceSpy: SpyObj<SocketRoomService>;
    let timeServiceSpy: SpyObj<TimeService>;
    let routerSpy: SpyObj<Router>;

    beforeEach(async () => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['initialize', 'firstQuestion', 'nextQuestion', 'getFeedBack']);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', [], ['time']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HostGameViewComponent],
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: SocketRoomService, useValue: socketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => 'test-game-id',
                            },
                        },
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HostGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize game and set current question on ngOnInit', fakeAsync(() => {
        const mockQuestion: Question = {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                {
                    text: 'Choice 1',
                    isCorrect: true,
                    numberAnswered: 0,
                    index: 0,
                },
                {
                    text: 'Choice 2',
                    isCorrect: false,
                    numberAnswered: 0,
                    index: 1,
                },
            ],
            answer: 'Choice 1',
        };
        gameManagerServiceSpy.firstQuestion.and.returnValue(mockQuestion);

        component.ngOnInit();
        tick();

        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should update bar chart data on receiving QCM_STATS event', fakeAsync(() => {
        const mockStat: QCMStats = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        const mockFeedback: Feedback[] = [{ choice: 'Option 1', status: 'correct' }];
        gameManagerServiceSpy.getFeedBack.and.returnValue(Promise.resolve(mockFeedback));

        component.ngOnInit();
        tick();

        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME_STATS && event === Events.QCM_STATS) {
                return of(mockStat);
            }
            return of({});
        });

        component.updateBarChartData(mockStat);
        tick();

        expect(component.statisticsData.length).toBeGreaterThan(0);
        expect(component.barChartData.length).toBeGreaterThan(0);
    }));

    it('should navigate to results page on receiving END_GAME event', fakeAsync(() => {
        component.ngOnInit();
        tick();

        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.END_GAME) {
                return of({});
            }
            return of({});
        });

        component.openResultsPage();
        tick();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', 'test-game-id', 'results']);
    }));

    it('should increment questionIndex and update currentQuestion on NEXT_QUESTION event', fakeAsync(() => {
        const mockQuestion: Question = {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                {
                    text: 'Choice 1',
                    isCorrect: true,
                    numberAnswered: 0,
                    index: 0,
                },
                {
                    text: 'Choice 2',
                    isCorrect: false,
                    numberAnswered: 0,
                    index: 1,
                },
            ],
            answer: 'Choice 1',
        };
        gameManagerServiceSpy.nextQuestion.and.returnValue(mockQuestion);

        component.ngOnInit();
        tick();

        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.NEXT_QUESTION) {
                return of({});
            }
            return of({});
        });

        component.nextQuestion();
        tick();

        expect(component.questionIndex).toBe(1);
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));
});
