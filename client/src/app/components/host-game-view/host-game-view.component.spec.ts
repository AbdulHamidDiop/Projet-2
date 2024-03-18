import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback, Player, Question, Type } from '@common/game';
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
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        socketServiceSpy.getPlayers.and.returnValue(of([]));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));

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

    it('should update players on component initialization', () => {
        const mockPlayers: Player[] = [
            { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 },
            { name: 'Player2', isHost: true, id: '2', score: 20, bonusCount: 1 },
        ];
        socketServiceSpy.getPlayers.and.returnValue(of(mockPlayers));

        fixture = TestBed.createComponent(HostGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.players).toEqual(mockPlayers);
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

        component.statisticsData = [
            {
                questionID: 'test-question-id',
                data: [
                    { data: [0], label: 'Choice 1', backgroundColor: '#4CAF50' },
                    { data: [0], label: 'Choice 2', backgroundColor: '#FF4C4C' },
                ],
            },
        ];

        component.ngOnInit();
        tick();

        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        fixture.whenStable().then(() => {
            expect(component.currentQuestion).toEqual(mockQuestion);
        });
    }));

    it('should return the current time from TimeService', () => {
        Object.defineProperty(timeServiceSpy, 'time', {
            get: jasmine.createSpy('time').and.returnValue(30),
        });
        expect(component.time).toBe(30);
    });

    it('should update bar chart data on receiving QCM_STATS event', fakeAsync(() => {
        const mockStat: QCMStats = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        const mockFeedback: Feedback[] = [
            { choice: 'Option 1', status: 'correct' },
            { choice: 'Option 2', status: 'incorrect' },
        ];
        gameManagerServiceSpy.getFeedBack.and.returnValue(Promise.resolve(mockFeedback));

        component.currentQuestion = {
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

    it('should update players on receiving UPDATE_PLAYER event', fakeAsync(() => {
        const mockPlayer: Player = { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 };
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME_STATS && event === Events.UPDATE_PLAYER) {
                return of(mockPlayer);
            }
            return of({});
        });

        component.updatePlayers(mockPlayer);
        tick();

        expect(component.players).toContain(mockPlayer);
    }));

    it('should decrement player score in updateBarChartData', fakeAsync(() => {
        component.statisticsData = [
            {
                questionID: 'test-question-id',
                data: [
                    { data: [1], label: 'Option 1', backgroundColor: '#4CAF50' },
                    { data: [0], label: 'Option 2', backgroundColor: '#FF4C4C' },
                ],
            },
        ];

        const mockStat: QCMStats = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: false,
            choiceAmount: 2,
            correctIndex: 0,
        };

        component.updateBarChartData(mockStat);
        tick();

        expect(component.statisticsData[0].data[0].data[0]).toBe(0);
    }));
});
