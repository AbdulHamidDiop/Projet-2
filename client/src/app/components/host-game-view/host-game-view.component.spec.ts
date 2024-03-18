import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Player, Question, Type } from '@common/game';
import { QCMStats } from '@common/game-stats';
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
    let mockQuestion: Question;
    let mockPlayers: Player[];
    let mockStat: QCMStats;
    let mockFeedback: Feedback[];

    beforeEach(async () => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['initialize', 'firstQuestion', 'nextQuestion', 'getFeedBack', 'endGame', 'reset']);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'timerEnded']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        // Mock data
        mockQuestion = {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true, numberAnswered: 0, index: 0 },
                { text: 'Choice 2', isCorrect: false, numberAnswered: 0, index: 1 },
            ],
            answer: 'Choice 1',
        };
        mockPlayers = [
            { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 },
            { name: 'Player2', isHost: true, id: '2', score: 20, bonusCount: 1 },
        ];
        mockStat = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        mockFeedback = [
            { choice: 'Option 1', status: 'correct' },
            { choice: 'Option 2', status: 'incorrect' },
        ];

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
        gameManagerServiceSpy.firstQuestion.and.returnValue(mockQuestion);
        socketServiceSpy.getPlayers.and.returnValue(of(mockPlayers));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update players on component initialization', () => {
        expect(component.players).toEqual(mockPlayers);
    });

    it('should initialize game and set current question on ngOnInit', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should return the current time from TimeService', () => {
        timeServiceSpy.time = 30;
        expect(component.time).toBe(30);
    });

    it('should update bar chart data on receiving QCM_STATS event', fakeAsync(() => {
        gameManagerServiceSpy.getFeedBack.and.returnValue(Promise.resolve(mockFeedback));
        component.currentQuestion = mockQuestion;
        component.updateBarChartData(mockStat);
        tick();
        expect(component.statisticsData.length).toBeGreaterThan(0);
        expect(component.barChartData.length).toBeGreaterThan(0);
    }));

    it('should navigate to results page on receiving END_GAME event', fakeAsync(() => {
        component.openResultsPage();
        tick();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', 'test-game-id', 'results']);
    }));

    it('should increment questionIndex and update currentQuestion on NEXT_QUESTION event', fakeAsync(() => {
        gameManagerServiceSpy.nextQuestion.and.returnValue(mockQuestion);
        component.nextQuestion();
        tick();
        expect(component.questionIndex).toBe(1);
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should update players on receiving UPDATE_PLAYER event', fakeAsync(() => {
        const mockPlayer: Player = { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 };
        component.updatePlayers(mockPlayer);
        tick();
        expect(component.players).toContain(mockPlayer);
    }));
});
