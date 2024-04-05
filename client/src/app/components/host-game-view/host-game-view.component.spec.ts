/* eslint-disable max-lines */
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Game, Player, Question, Type } from '@common/game';
import { BarChartChoiceStats, QCMStats, QRLAnswer, QRLStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { Subscription, of } from 'rxjs';
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
    const START_TIMER_DELAY = 500;

    beforeEach(async () => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', [
            'initialize',
            'firstQuestion',
            'goNextQuestion',
            'getFeedBack',
            'endGame',
            'reset',
            'onLastQuestion',
        ]);
        gameManagerServiceSpy.game = { id: 'test-game-id', questions: [], duration: 10 } as unknown as Game;
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage', 'endGame']);
        socketServiceSpy.getPlayers.and.returnValue(of([]));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        socketServiceSpy.endGame.and.returnValue();
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'activatePanicMode', 'deactivatePanicMode'], {
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
            imports: [RouterTestingModule, MatSnackBarModule, NoopAnimationsModule],
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
        component.unitTesting = true;
        component.currentQuestion = mockQuestion;
        gameManagerServiceSpy.firstQuestion.and.returnValue(mockQuestion);
        socketServiceSpy.getPlayers.and.returnValue(of(mockPlayers));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        fixture.detectChanges();
        jasmine.getEnv().allowRespy(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle END_GAME event from SocketRoomService', fakeAsync(() => {
        const openResultsPageSpy = spyOn(component, 'openResultsPage');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.END_GAME) {
                return of({});
            }
            return of({});
        });
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY); // couvrir le max de delay
        flush();
        expect(openResultsPageSpy).toHaveBeenCalled();
    }));

    it('should handle UPDATE_PLAYER event from SocketRoomService', fakeAsync(() => {
        const mockPlayerWithRoom = { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0, room: 'test-room' };
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME_STATS && event === Events.UPDATE_PLAYER) {
                return of(mockPlayerWithRoom);
            }
            return of({});
        });
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
    }));

    it('should initialize game and set current question on ngOnInit', fakeAsync(() => {
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should return the current time from TimeService', () => {
        timeServiceSpy.time = 0;
        expect(component.time).toBe(0);
    });

    it('should update player info on receiving QCM_STATS event', () => {
        component.players = [{ name: 'A', score: 0 } as Player];
        mockStat.player = { name: 'A', score: 2 } as Player;
        component.updatePlayerFromServer(mockStat);
        expect(component.players[0].score).toEqual(2);
    });

    it('should update bar chart data on receiving QCM_STATS event', fakeAsync(() => {
        gameManagerServiceSpy.getFeedBack.and.returnValue(Promise.resolve(mockFeedback));
        component.currentQuestion = mockQuestion;
        component.updateBarChartData(mockStat);
        tick();
        expect(component.statisticsData.length).toBeGreaterThan(0);
        expect(component.barChartData.length).toBeGreaterThan(0);
    }));

    it('should decrement bar chart data when stat.selected is false and data value is greater than 0', fakeAsync(() => {
        const initialStat: QCMStats = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        const decrementStat: QCMStats = {
            ...initialStat,
            selected: false,
        };
        component.statisticsData = [
            {
                questionID: 'test-question-id',
                data: [
                    {
                        data: [1],
                        label: 'Choice 1',
                        backgroundColor: '#4CAF50',
                    },
                    {
                        data: [0],
                        label: 'Choice 2',
                        backgroundColor: '#FF4C4C',
                    },
                ],
            },
        ];
        component.updateBarChartData(initialStat);
        tick();
        expect(component.statisticsData[0].data[0].data[0]).toBe(2);
        component.updateBarChartData(decrementStat);
        tick();
        expect(component.statisticsData[0].data[0].data[0]).toBe(1);
        expect(component.barChartData).toEqual(component.statisticsData[0].data);
    }));

    it('should navigate to results page on receiving END_GAME event', fakeAsync(() => {
        component.openResultsPage();
        const SERVER_RESPONSE_DELAY = 500;
        tick(SERVER_RESPONSE_DELAY);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', 'test-game-id', 'results']);
    }));

    it('should update currentQuestion on NEXT_QUESTION event', fakeAsync(() => {
        gameManagerServiceSpy.goNextQuestion.and.returnValue(mockQuestion);
        component.choseNextQuestion();
        tick();
        expect(component.currentQuestion).toEqual(mockQuestion);
    }));

    it('should handle NEXT_QUESTION event correctly', fakeAsync(() => {
        const nextQuestionSpy = spyOn(component.gameManagerService, 'goNextQuestion');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.NEXT_QUESTION) {
                return of({});
            }
            return of({});
        });
        tick(2 * SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
        expect(nextQuestionSpy).not.toHaveBeenCalled();
    }));

    it('should call showResults and send SHOW_RESULTS and STOP_TIMER messages', () => {
        component.showResults();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.SHOW_RESULTS, Namespaces.GAME);
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
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
        component.notifyEndGame();
        tick(SHOW_FEEDBACK_DELAY);
        expect(component.showResults).toHaveBeenCalled();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.END_GAME, Namespaces.GAME);
    }));

    it('should show results when endGame is true', () => {
        spyOn(component, 'showResults');
        component.gameManagerService.endGame = true;
        component.choseNextQuestion();
        component.notifyEndGame();
        expect(component.showResults).toHaveBeenCalled();
    });

    it('should update QRL grade data', () => {
        component.questionIndex = 0;
        component.statisticsData[component.questionIndex] = {
            questionID: '1',
            data: [
                { data: [0], label: 'label1', backgroundColor: '#FF4C4C' },
                { data: [0], label: 'label2', backgroundColor: '#FFCE56' },
                { data: [0], label: 'label3', backgroundColor: '#4CAF50' },
            ],
        };

        component.updateQRLGradeData(0);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        component.updateQRLGradeData(0.5);
        component.updateQRLGradeData(1);
        component.updateQRLGradeData(2);
        expect(component.statisticsData[component.questionIndex].data[0].data[0]).toEqual(1);
    });

    it('should grade answers', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        spyOn(timeServiceSpy, 'stopTimer');

        component.gradeAnswers();

        expect(socketServiceSpy.sendMessage).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalled();
    });

    it('should send QRL grade', () => {
        component.statisticsData[component.questionIndex] = {
            questionID: '1',
            data: [
                { data: [0], label: 'label1', backgroundColor: '#FF4C4C' },
                { data: [0], label: 'label2', backgroundColor: '#FFCE56' },
                { data: [0], label: 'label3', backgroundColor: '#4CAF50' },
            ],
        };
        component.currentQRLAnswer = { author: 'author1' } as QRLAnswer;
        spyOn(socketServiceSpy, 'sendMessage');
        spyOn(gameManagerServiceSpy, 'onLastQuestion').and.returnValue(false);

        component.qRLAnswers = [{ author: 'author1' }, { author: 'author2' }] as QRLAnswer[];
        component.currentQuestion = { id: '1', points: 10 } as Question;

        component.sendQRLGrade(1);

        expect(socketServiceSpy.sendMessage).toHaveBeenCalled();
        expect(component.qRLAnswers.length).toEqual(1);

        component.sendQRLGrade(1);
        expect(component.qRLAnswers.length).toEqual(0);

        spyOn(gameManagerServiceSpy, 'onLastQuestion').and.returnValue(true);
        component.currentQRLAnswer = { author: 'author1' } as QRLAnswer;
        component.sendQRLGrade(1);
        expect(component.qRLAnswers.length).toEqual(0);
    });

    it('should notify next question when statisticsData for current questionIndex does not exist', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.questionIndex = 0;
        component.currentQuestion = { id: '1' } as Question;
        component.statisticsData = [];
        component.notifyNextQuestion();

        expect(component.statisticsData[component.questionIndex]).toEqual({
            questionID: component.currentQuestion.id,
            data: [],
        });
        expect(component.disableControls).toBeTrue();
        expect(component.questionLoaded).toBeFalse();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should notify next question when statisticsData for current questionIndex exists', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.questionIndex = 0;
        component.currentQuestion = { id: '1' } as Question;
        component.statisticsData[component.questionIndex] = {
            questionID: '2',
            data: [],
        };

        component.notifyNextQuestion();

        expect(component.statisticsData[component.questionIndex]).toEqual({
            questionID: '2',
            data: [],
        });
        expect(component.disableControls).toBeTrue();
        expect(component.questionLoaded).toBeFalse();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should increment data when stat is edited', async () => {
        const stat: QRLStats = { questionId: '1', edited: true };
        component.statisticsData = [{ questionID: '1', data: [{ data: [0] }, { data: [0] }] as BarChartChoiceStats[] }];

        await component.updateQRLBarChartData(stat);

        expect(component.statisticsData[0].data[0].data[0]).toEqual(1);
    });

    it('should decrement data when stat is not edited and data is greater than 0', async () => {
        const stat: QRLStats = { questionId: '1', edited: false };
        component.statisticsData = [{ questionID: '1', data: [{ data: [1] }, { data: [0] }] as BarChartChoiceStats[] }];

        await component.updateQRLBarChartData(stat);

        expect(component.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should not change data when stat is not edited and data is 0', async () => {
        const stat: QRLStats = { questionId: '1', edited: false } as QRLStats;
        component.statisticsData = [{ questionID: '1', data: [{ data: [0] }, { data: [0] }] as BarChartChoiceStats[] }];

        await component.updateQRLBarChartData(stat);

        expect(component.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should decrement the first data point of the first data set', () => {
        const stat: QRLStats = {
            questionId: '1',
            edited: false,
        };

        component.updateQRLBarChartData(stat);

        expect(component.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should send SHOW_RESULTS message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.showResults();

        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.SHOW_RESULTS, Namespaces.GAME);
    });

    it('should send PAUSE_TIMER message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.sendTimerControlMessage();

        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.PAUSE_TIMER, Namespaces.GAME);
    });

    it('should activate panic mode and send PANIC_MODE message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.currentQuestion = { type: Type.QCM } as Question;

        component.activatePanicMode();

        expect(component.inPanicMode).toBeTrue();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.PANIC_MODE, Namespaces.GAME, { type: Type.QCM });
    });

    it('should call notifyNextQuestion for QCM type', () => {
        spyOn(component, 'notifyNextQuestion');
        spyOn(component, 'gradeAnswers');
        component.currentQuestion = { type: Type.QCM } as Question;

        component.handleTimerEnd();

        expect(component.notifyNextQuestion).toHaveBeenCalled();
        expect(component.gradeAnswers).not.toHaveBeenCalled();
    });

    it('should call gradeAnswers for non-QCM type', () => {
        spyOn(component, 'gradeAnswers');
        spyOn(component, 'notifyNextQuestion');
        component.currentQuestion = { type: Type.QRL } as Question;

        component.handleTimerEnd();

        expect(component.notifyNextQuestion).not.toHaveBeenCalled();
        expect(component.gradeAnswers).toHaveBeenCalled();
    });

    it('should unsubscribe after ngOnDestroy', () => {
        spyOn(component.gameManagerService, 'reset');
        component.unitTesting = false;
        component.playerLeftSubscription = new Subscription();
        component.getPlayersSubscription = new Subscription();
        component.nextQuestionSubscription = new Subscription();
        component.qcmStatsSubscription = new Subscription();
        component.timerEndedSubscription = new Subscription();
        component.endGameSubscription = new Subscription();
        component.updatePlayerSubscription = new Subscription();

        component.ngOnDestroy();
        expect(component.gameManagerService.reset).toHaveBeenCalled();
    });
});
