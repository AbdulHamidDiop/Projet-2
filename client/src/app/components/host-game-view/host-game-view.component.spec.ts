import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Player, Question, Type } from '@common/game';
import { Feedback } from '@common/feedback';
import { QCMStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { of } from 'rxjs';
import { HostGameViewComponent } from './host-game-view.component';
import SpyObj = jasmine.SpyObj;

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
    const SHOW_FEEDBACK_DELAY = 3000;

    beforeEach(async () => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', [
            'initialize',
            'firstQuestion',
            'nextQuestion',
            'getFeedBack',
            'endGame',
            'reset',
        ]);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'timerEnded']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        socketServiceSpy.getPlayers.and.returnValue(of([]));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer'], {
            timerEnded: new EventEmitter<void>(),
        });

        // Mock data
        mockQuestion = {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true, index: 0 },
                { text: 'Choice 2', isCorrect: false, index: 1 },
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
                { provide: TimeService, useValue: timeServiceSpy },
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
        spyOn(component, 'notifyNextQuestion');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle timerEnded event from TimeService', fakeAsync(() => {
        component.ngOnInit();
        timeServiceSpy.timerEnded.emit();
        tick();
        expect(component.notifyNextQuestion).toHaveBeenCalled();
    }));

    it('should handle END_GAME event from SocketRoomService', fakeAsync(() => {
        const openResultsPageSpy = spyOn(component, 'openResultsPage');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.END_GAME) {
                return of({});
            }
            return of({});
        });
        component.ngOnInit();
        tick();
        expect(openResultsPageSpy).toHaveBeenCalled();
    }));

    it('should handle UPDATE_PLAYER event from SocketRoomService', fakeAsync(() => {
        const mockPlayerWithRoom = { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0, room: 'test-room' };
        //        const updatePlayersSpy = spyOn(component, 'updatePlayers');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME_STATS && event === Events.UPDATE_PLAYER) {
                return of(mockPlayerWithRoom);
            }
            return of({});
        });
        component.ngOnInit();
        tick();
        /* expect(updatePlayersSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({ name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 }),
        );*/
    }));

    it('should update players on component initialization', () => {
        socketServiceSpy.getPlayers.and.returnValue(of(mockPlayers));

        fixture = TestBed.createComponent(HostGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.players).toEqual(mockPlayers);
    });

    it('should initialize game and set current question on ngOnInit', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should return the current time from TimeService', () => {
        timeServiceSpy.time = 0;
        expect(component.time).toBe(0);
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
        //        component.updatePlayers(mockPlayer);
        tick();
        expect(component.players).toContain(mockPlayer);
    }));

    it('should call showResults and send SHOW_RESULTS and STOP_TIMER messages', () => {
        component.showResults();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.SHOW_RESULTS, Namespaces.GAME);
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should call notifyNextQuestion and send STOP_TIMER message', () => {
        component.notifyNextQuestion();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should set onLastQuestion to true and call showResults when endGame is true', () => {
        spyOn(component, 'showResults');
        gameManagerServiceSpy.endGame = true;
        component.notifyNextQuestion();
        expect(component.onLastQuestion).toBeTrue();
        expect(component.showResults).toHaveBeenCalled();
    });

    it('should send NEXT_QUESTION message when endGame is false', () => {
        gameManagerServiceSpy.endGame = false;
        component.notifyNextQuestion();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.NEXT_QUESTION, Namespaces.GAME);
    });

    it('should set showCountDown to true when openCountDownModal is called', () => {
        component.openCountDownModal();
        expect(component.showCountDown).toBeTrue();
    });

    it('should set showCountDown to false when onCountDownModalClosed is called', () => {
        component.onCountDownModalClosed();
        expect(component.showCountDown).toBeFalse();
    });

    it('should call showResults and sendMessage with END_GAME event after a delay', fakeAsync(() => {
        spyOn(component, 'showResults');
        spyOn(socketServiceSpy, 'sendMessage');
        component.notifyEndGame();
        tick(SHOW_FEEDBACK_DELAY);
        expect(component.showResults).toHaveBeenCalled();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.END_GAME, Namespaces.GAME);
    }));
});
